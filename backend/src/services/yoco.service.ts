import axios from 'axios';
import { YocoPayment, VerifyPaymentRequest } from '../types';
import { config } from '../config';

const YOCO_API_URL = 'https://online.yoco.com/v1';

export class YocoService {
  private readonly headers = {
    'Authorization': `Bearer ${config.yocoSecretKey}`,
    'Content-Type': 'application/json'
  };

  async verifyPayment(data: VerifyPaymentRequest): Promise<YocoPayment> {
    try {
      const response = await axios.post(
        `${YOCO_API_URL}/charges`,
        {
          token: data.token,
          amountInCents: Math.round(data.amount * 100),
          currency: data.currency,
          metadata: data.metadata
        },
        { headers: this.headers }
      );

      return {
        id: response.data.id,
        amount: response.data.amountInCents / 100,
        currency: response.data.currency,
        status: response.data.status === 'successful' ? 'successful' : 'failed',
        metadata: response.data.metadata
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  }

  async getPayment(paymentId: string): Promise<YocoPayment> {
    try {
      const response = await axios.get(
        `${YOCO_API_URL}/charges/${paymentId}`,
        { headers: this.headers }
      );

      return {
        id: response.data.id,
        amount: response.data.amountInCents / 100,
        currency: response.data.currency,
        status: response.data.status === 'successful' ? 'successful' : 'failed',
        metadata: response.data.metadata
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment');
    }
  }
}