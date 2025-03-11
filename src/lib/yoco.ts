import { loadScript } from '@/lib/utils';

const YOCO_PUBLIC_KEY = 'pk_test_076a52e0R4velyDbbd24';
// Note: Secret key should only be used in your backend

interface YocoPaymentConfig {
  amountInCents: number;
  currency: string;
  name: string;
  description: string;
  callback: (result: any) => void;
}

export interface YocoPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  notIncluded?: string[];
}

let yocoSDKLoaded = false;

export const initYocoSDK = async () => {
  if (yocoSDKLoaded) return;
  
  await loadScript('https://js.yoco.com/sdk/v1/yoco-sdk-web.js');
  yocoSDKLoaded = true;
};

export const createYocoPopup = async ({
  amountInCents,
  currency = 'ZAR',
  name,
  description,
  callback
}: YocoPaymentConfig) => {
  await initYocoSDK();

  const yoco = new (window as any).YocoSDK({
    publicKey: YOCO_PUBLIC_KEY
  });

  yoco.showPopup({
    amountInCents,
    currency,
    name,
    description,
    callback: (result: any) => {
      if (result.error) {
        callback({ 
          error: true, 
          message: result.error.message,
          type: 'error' 
        });
      } else {
        callback({
          error: false,
          type: 'success',
          data: result
        });
      }
    }
  });
};

export const defaultPlans: YocoPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic CV analysis for individuals',
    price: 0,
    interval: 'month',
    features: [
      'Basic CV analysis',
      'ATS compatibility check',
      '3 analyses per month',
      'Basic keyword analysis',
      'Standard response time',
    ],
    notIncluded: [
      'Industry comparison',
      'Detailed section analysis',
      'Priority support',
      'Custom branding',
      'API access',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced features for job seekers',
    price: 50,
    interval: 'month',
    features: [
      'Everything in Free, plus:',
      'Unlimited CV analyses',
      'Industry comparison',
      'Detailed section analysis',
      'Priority support',
      'Export to PDF',
      'Interview preparation tips',
      'Custom keyword targeting',
    ],
    notIncluded: [
      'Custom branding',
      'API access',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solution for businesses',
    price: 199,
    interval: 'month',
    features: [
      'Everything in Premium, plus:',
      'Custom branding',
      'API access',
      'Bulk CV analysis',
      'Team collaboration',
      'Analytics dashboard',
      'Dedicated account manager',
      'Custom integration options',
      'SLA guarantees',
    ],
  },
];

export const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${API_URL}/api/subscriptions/${userId}`);
    const data = await response.json();
    
    return data.success && data.data !== null;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};