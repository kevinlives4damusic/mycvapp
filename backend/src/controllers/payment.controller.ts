import { Request, Response } from 'express';
import { YocoService } from '../services/yoco.service';
import { FirebaseService } from '../services/firebase.service';
import { VerifyPaymentRequest, Subscription } from '../types';

const yocoService = new YocoService();
const firebaseService = new FirebaseService();

export class PaymentController {
  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentData = req.body;
      console.log('Received payment verification request:', paymentData);

      // Basic validation
      if (!paymentData.token || !paymentData.amount || !paymentData.currency) {
        console.error('Missing required payment information:', paymentData);
        res.status(400).json({
          success: false,
          message: 'Missing required payment information'
        });
        return;
      }

      // Verify the payment with Yoco
      console.log('Verifying payment with Yoco...');
      const payment = await yocoService.verifyPayment(paymentData);
      console.log('Yoco payment verification response:', payment);

      if (payment.status === 'successful' && paymentData.metadata?.userId && paymentData.metadata?.planId) {
        console.log('Payment successful, creating subscription...');
        // Create subscription
        const subscription: Omit<Subscription, 'id'> = {
          userId: paymentData.metadata.userId,
          planId: paymentData.metadata.planId,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency
        };

        const createdSubscription = await firebaseService.createSubscription(subscription);
        console.log('Subscription created:', createdSubscription);

        // Return the response with subscription
        res.status(200).json({
          success: true,
          message: 'Payment verified and subscription created successfully',
          data: payment,
          subscription: createdSubscription
        });
        return;
      }

      // Return the response without subscription for failed payments
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: payment
      });
    } catch (error: any) {
      console.error('Payment verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Payment verification failed',
        error: error.response?.data || error.message
      });
    }
  }

  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: 'Payment ID is required'
        });
        return;
      }

      const payment = await yocoService.getPayment(paymentId);

      res.status(200).json({
        success: true,
        message: 'Payment retrieved successfully',
        data: payment
      });
    } catch (error: any) {
      console.error('Get payment error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve payment',
        error: error.message
      });
    }
  }

  async getUserSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const subscription = await firebaseService.getSubscription(userId);

      res.status(200).json({
        success: true,
        message: subscription ? 'Subscription found' : 'No active subscription found',
        data: subscription
      });
    } catch (error: any) {
      console.error('Get subscription error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve subscription',
        error: error.message
      });
    }
  }
}