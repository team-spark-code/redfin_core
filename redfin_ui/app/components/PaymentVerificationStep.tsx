import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { loadTossPayments } from '@tosspayments/payment-widget-sdk';

interface PaymentVerificationStepProps {
  onBack: () => void;
  onSuccess: (authData: any) => void;
  userInfo: {
    email: string;
    fullName: string;
    phoneNumber?: string;
  };
}

export function PaymentVerificationStep({ onBack, onSuccess, userInfo }: PaymentVerificationStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentWidget, setPaymentWidget] = useState<any>(null);
  const paymentMethodsWidgetRef = useRef<HTMLDivElement>(null);

  // 토스페이먼츠 클라이언트 키 (환경변수로 설정)
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        
        const widget = tossPayments.widgets({
          customerKey: `customer_${Date.now()}`,
        });
        
        setPaymentWidget(widget);

        // 결제 수단 위젯 렌더링
        if (paymentMethodsWidgetRef.current) {
          await widget.renderPaymentMethods({
            selector: '#payment-methods',
            variantKey: 'DEFAULT'
          });
        }
      } catch (err) {
        console.error('토스페이먼츠 초기화 실패:', err);
        setError('결제 시스템 초기화에 실패했습니다.');
      }
    };

    initializePayment();
  }, [clientKey]);

  const handlePaymentVerification = async () => {
    if (!paymentWidget) {
      setError('결제 시스템이 준비되지 않았습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 본인인증을 위한 소액 결제 (100원)
      const orderId = `verify_${Date.now()}`;
      const amount = 100;

      const response = await paymentWidget.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: amount,
        },
        orderId,
        orderName: '회원가입 본인인증',
        customerName: userInfo.fullName,
        customerEmail: userInfo.email,
        customerMobilePhone: userInfo.phoneNumber,
        successUrl: `${window.location.origin}/signup/payment-success`,
        failUrl: `${window.location.origin}/signup/payment-fail`,
        validHours: 1,
      });

      // 결제 성공 시 본인인증 완료 처리
      onSuccess({
        orderId,
        amount,
        customerKey: response.customerKey,
        verifiedAt: new Date().toISOString(),
      });

    } catch (err: any) {
      console.error('결제 인증 실패:', err);
      setError(err.message || '본인인증에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // 결제 인증 없이 진행 (개발/테스트용)
    onSuccess({
      orderId: `skip_${Date.now()}`,
      amount: 0,
      verified: false,
      skippedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>본인인증</CardTitle>
              </div>
            </div>
            <CardDescription>
              안전한 서비스 이용을 위해 결제 수단을 통한 본인인증을 진행합니다.
              <br />
              소액(100원)이 결제되며, 인증 완료 후 자동으로 환불됩니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">본인인증 안내</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 결제 수단을 통한 실명 확인이 진행됩니다</li>
                    <li>• 100원이 결제되며, 인증 완료 후 즉시 환불됩니다</li>
                    <li>• 신용카드, 체크카드 모두 사용 가능합니다</li>
                    <li>• 개인정보는 인증 목적으로만 사용됩니다</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                결제 수단 선택
              </h3>
              
              <div 
                id="payment-methods" 
                ref={paymentMethodsWidgetRef}
                className="min-h-[200px] border rounded-lg p-4"
              >
                {!paymentWidget && (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center space-y-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm text-muted-foreground">결제 시스템 로딩 중...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handlePaymentVerification}
                disabled={isLoading || !paymentWidget}
                className="flex-1"
              >
                {isLoading ? '인증 진행 중...' : '본인인증 진행'}
              </Button>
              
              {process.env.NODE_ENV === 'development' && (
                <Button 
                  variant="outline" 
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  건너뛰기
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>※ 본인인증은 전자금융거래법에 따른 의무사항입니다.</p>
              <p>※ 입력하신 정보는 본인인증 외의 용도로 사용되지 않습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}