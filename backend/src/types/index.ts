export interface YocoPayment {
  id: string;
  amount: number;
  currency: string;
  status: 'successful' | 'failed';
  metadata?: any;
}

export interface VerifyPaymentRequest {
  token: string;
  amount: number;
  currency: string;
  metadata?: {
    userId: string;
    planId: string;
    [key: string]: any;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  paymentId: string;
  amount: number;
  currency: string;
}