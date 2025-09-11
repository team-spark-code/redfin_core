import { useState } from 'react';
import { SignupPage } from './SignupPage';
import { PaymentVerificationStep } from './PaymentVerificationStep';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle } from 'lucide-react';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

interface PaymentAuthData {
  orderId: string;
  amount: number;
  customerKey?: string;
  verifiedAt?: string;
  verified?: boolean;
  skippedAt?: string;
}

interface SignupWithPaymentProps {
  onBack: () => void;
  onComplete?: (userData: SignupFormData & { paymentAuth: PaymentAuthData }) => void;
}

export function SignupWithPayment({ onBack, onComplete }: SignupWithPaymentProps) {
  const [currentStep, setCurrentStep] = useState<'signup' | 'payment' | 'complete'>('signup');
  const [signupData, setSignupData] = useState<SignupFormData | null>(null);
  const [paymentAuthData, setPaymentAuthData] = useState<PaymentAuthData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignupSubmit = async (data: SignupFormData) => {
    setSignupData(data);
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async (authData: PaymentAuthData) => {
    setPaymentAuthData(authData);
    setIsProcessing(true);

    try {
      if (!signupData) {
        throw new Error('회원가입 정보가 없습니다.');
      }

      // 백엔드 API 호출하여 회원가입 완료
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...signupData,
          paymentAuth: authData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
      }

      const result = await response.json();
      setCurrentStep('complete');
      
      // 상위 컴포넌트에 완료 알림
      if (onComplete) {
        onComplete({
          ...signupData,
          paymentAuth: authData,
        });
      }

    } catch (error: any) {
      console.error('회원가입 처리 실패:', error);
      alert(error.message || '회원가입 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToSignup = () => {
    setCurrentStep('signup');
    setPaymentAuthData(null);
  };

  if (currentStep === 'signup') {
    return (
      <SignupPage 
        onBack={onBack}
        onSubmit={handleSignupSubmit}
      />
    );
  }

  if (currentStep === 'payment') {
    return (
      <PaymentVerificationStep
        onBack={handleBackToSignup}
        onSuccess={handlePaymentSuccess}
        userInfo={{
          email: signupData?.email || '',
          fullName: signupData?.fullName || '',
          phoneNumber: signupData?.phoneNumber,
        }}
      />
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">회원가입 완료!</h1>
              <p className="text-muted-foreground">
                {signupData?.fullName}님, 환영합니다!
                <br />
                본인인증이 완료되어 모든 서비스를 이용하실 수 있습니다.
              </p>
            </div>

            {paymentAuthData && paymentAuthData.verified !== false && (
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  본인인증이 완료되었습니다. 결제된 금액(100원)은 자동으로 환불 처리됩니다.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
              >
                로그인하기
              </button>
              
              <button
                onClick={onBack}
                className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors"
              >
                메인으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}