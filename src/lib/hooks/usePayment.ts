import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { createYocoPopup } from '@/lib/yoco';
import { useUser } from '@/components/auth/UserContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  // Helper function to safely get user ID
  const getUserId = () => {
    if (!user) return null;
    return (user as any).uid || user.id;
  };

  const handleSubscribe = async (planId: string, amount: number) => {
    try {
      setIsLoading(true);

      if (!user) {
        // Save selected plan to session storage
        sessionStorage.setItem('selectedPlan', planId);
        navigate('/login');
        return;
      }

      if (planId === 'free') {
        navigate('/dashboard');
        return;
      }

      if (planId === 'enterprise') {
        navigate('/contact');
        return;
      }

      // Convert amount to cents for Yoco
      const amountInCents = Math.round(amount * 100);

      createYocoPopup({
        amountInCents,
        currency: 'ZAR',
        name: 'CV Analyzer Subscription',
        description: `Monthly subscription for ${planId} plan`,
        callback: async (result) => {
          if (result.error) {
            toast({
              title: 'Payment Failed',
              description: result.message,
              variant: 'destructive',
            });
            setIsLoading(false);
          } else {
            try {
              // Verify payment with backend
              const response = await fetch(`${API_URL}/api/payments/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  token: result.data.id,
                  amount: amount,
                  currency: 'ZAR',
                  metadata: {
                    userId: getUserId(),
                    planId: planId,
                  },
                }),
              });

              const data = await response.json();

              if (data.success) {
                toast({
                  title: 'Payment Successful',
                  description: 'Your subscription has been activated.',
                });
                
                // Navigate to success page with payment ID
                navigate(`/payment-success?payment_id=${data.data?.id || 'unknown'}`);
              } else {
                throw new Error(data.message);
              }
            } catch (error: any) {
              toast({
                title: 'Verification Failed',
                description: error.message || 'Failed to verify payment',
                variant: 'destructive',
              });
              setIsLoading(false);
            }
          }
        },
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubscribe,
  };
}