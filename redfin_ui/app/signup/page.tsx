"use client";

import { signup } from "../../lib/actions/user";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, Eye, EyeOff, ArrowLeft, Shield, CreditCard } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

// Toss Payments 타입 정의
declare global {
  interface Window {
    TossPayments: any;
  }
}

// 폼 제출 버튼 컴포넌트 (로딩 상태 표시)
export default function SignupPage() {
  const [state, formAction] = useFormState(signup, { error: undefined });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeTermsError, setAgreeTermsError] = useState("");
  
  // 결제 인증 관련 상태
  const [showPaymentVerification, setShowPaymentVerification] = useState(false);
  const [paymentWidget, setPaymentWidget] = useState<any>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const paymentMethodsRef = useRef<HTMLDivElement>(null);

  const phone1Ref = useRef<HTMLInputElement>(null);
  const phone2Ref = useRef<HTMLInputElement>(null);
  const phone3Ref = useRef<HTMLInputElement>(null);

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

  // 결제 시스템 시뮬레이션
  useEffect(() => {
    if (showPaymentVerification) {
      // 시뮬레이션을 위한 지연
      const timer = setTimeout(() => {
        setPaymentWidget({ ready: true });
        setPaymentError(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [showPaymentVerification]);

  // 결제 인증 처리 (시뮬레이션)
  const handlePaymentVerification = async () => {
    if (!paymentWidget || !paymentWidget.ready) {
      setPaymentError('결제 시스템이 준비되지 않았습니다.');
      return;
    }

    setIsPaymentLoading(true);
    setPaymentError(null);

    try {
      // 실제 결제 대신 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 본인인증 완료 처리
      console.log('본인인증 완료: paymentVerified 상태를 true로 변경');
      setPaymentVerified(true);
      setShowPaymentVerification(false);
      alert('본인인증이 완료되었습니다! 이제 회원가입을 진행하세요.');
      
      // 상태 변경 확인을 위한 로그
      setTimeout(() => {
        console.log('본인인증 상태 확인:', { paymentVerified: true });
      }, 100);

    } catch (err: any) {
      console.error('결제 인증 실패:', err);
      setPaymentError(err.message || '본인인증에 실패했습니다.');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // 커스텀 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfirmPasswordError("");
    setPhoneError("");
    setAgreeTermsError("");
    
    if (!agreeTerms) {
      setAgreeTermsError("회원가입을 위해 이용약관에 동의해야 합니다.");
      return;
    }
    
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;
    if (password !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    // 전화번호 유효성 검사
    if (!/^\d{3}$/.test(phone1) || !/^\d{3,4}$/.test(phone2) || !/^\d{4}$/.test(phone3)) {
      setPhoneError("휴대폰 번호를 올바르게 입력하세요. 예: 010-1234-5678");
      return;
    }

    // 결제 인증이 완료되지 않은 경우 인증 단계로 이동
    if (!paymentVerified) {
      setShowPaymentVerification(true);
      return;
    }

    // FormData에 phone 필드 추가
    const formData = new FormData(form);
    formData.set("phone", `${phone1}-${phone2}-${phone3}`);
    formData.set("paymentVerified", "true");
    formAction(formData);
  };

  if (showPaymentVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-0"
                  onClick={() => setShowPaymentVerification(false)}
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle className="text-2xl font-bold">본인인증</CardTitle>
                </div>
              </div>
              <CardDescription className="text-center">
                안전한 서비스 이용을 위해 결제 수단을 통한 본인인증을 진행합니다.
                <br />
                소액(100원)이 결제되며, 인증 완료 후 자동으로 환불됩니다.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {paymentError && (
                <Alert variant="destructive">
                  <AlertDescription>{paymentError}</AlertDescription>
                </Alert>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• 결제 수단을 통한 실명 확인이 진행됩니다</p>
                  <p>• 100원이 결제되며, 인증 완료 후 즉시 환불됩니다</p>
                  <p>• 신용카드, 체크카드 모두 사용 가능합니다</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  결제 수단 선택
                </h3>
                
                <div className="min-h-[200px] border rounded-lg p-6">
                  {!paymentWidget || !paymentWidget.ready ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="text-center space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="text-sm text-gray-500">결제 시스템 준비 중...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CreditCard className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">결제 수단이 준비되었습니다</h4>
                        <p className="text-sm text-gray-600">
                          신용카드 또는 체크카드로 100원 결제 후<br />
                          즉시 환불 처리됩니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handlePaymentVerification}
                  disabled={isPaymentLoading || !paymentWidget}
                  className="flex-1"
                >
                  {isPaymentLoading ? '인증 진행 중...' : '본인인증 진행'}
                </Button>
                
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      console.log('개발 모드: 본인인증 건너뛰기');
                      setPaymentVerified(true);
                      setShowPaymentVerification(false);
                      alert('개발 모드: 본인인증을 건너뛰었습니다.');
                      
                      // 상태 변경 확인을 위한 로그
                      setTimeout(() => {
                        console.log('건너뛰기 후 상태:', { paymentVerified: true });
                      }, 100);
                    }}
                    disabled={isPaymentLoading}
                  >
                    건너뛰기
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center relative">
                <Link href="/" className="absolute left-0">
                    <Button variant="ghost" size="icon" aria-label="뒤로가기">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
            </div>
            <CardDescription className="text-center">
              새 계정을 만들어 서비스를 시작하세요
              {paymentVerified && (
                <span className="block text-green-600 text-sm mt-2 font-medium">
                  ✓ 본인인증이 완료되었습니다
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 성공 메시지 */}
            {state?.success && (
              <Alert className="mb-4">
                <AlertDescription>{state.success}</AlertDescription>
              </Alert>
            )}

            {/* 폼 전체 오류 메시지 */}
            {state?.error?.form && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{state.error.form}</AlertDescription>
              </Alert>
            )}

            {/* 비밀번호 불일치 오류 메시지 */}
            {confirmPasswordError && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{confirmPasswordError}</AlertDescription>
              </Alert>
            )}

            {/* 휴대폰 번호 오류 메시지 */}
            {phoneError && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{phoneError}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="홍길동"
                  required
                  autoComplete="name"
                />
                {/* 필드별 오류 메시지 */}
                {state?.error?.fields?.name && (
                  <p className="text-sm text-red-600">
                    {state.error.fields.name[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
                {/* 필드별 오류 메시지 */}
                {state?.error?.fields?.email && (
                  <p className="text-sm text-red-600">
                    {state.error.fields.email[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8자 이상의 비밀번호"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {/* 필드별 오류 메시지 */}
                {state?.error?.fields?.password && (
                  <p className="text-sm text-red-600">
                    {state.error.fields.password[0]}
                  </p>
                )}
              </div>

              {/* 비밀번호 재입력 필드 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 재입력</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">생년월일</Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  required
                  autoComplete="bday"
                />
                {/* 필드별 오류 메시지 */}
                {state?.error?.fields?.birthdate && (
                  <p className="text-sm text-red-600">
                    {state.error.fields.birthdate[0]}
                  </p>
                )}
              </div>

              {/* 휴대폰 번호 입력 필드 (3개) */}
              <div className="space-y-2">
                <Label htmlFor="phone1">휴대폰 번호</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone1"
                    name="phone1"
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    pattern="\d{3}"
                    placeholder="010"
                    required
                    value={phone1}
                    ref={phone1Ref}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setPhone1(value);
                      if (value.length === 3) {
                        phone2Ref.current?.focus();
                      }
                    }}
                    className="w-16"
                  />
                  <span className="self-center">-</span>
                  <Input
                    id="phone2"
                    name="phone2"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="\d{3,4}"
                    placeholder="1234"
                    required
                    value={phone2}
                    ref={phone2Ref}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setPhone2(value);
                      if ((value.length === 4 || value.length === 3) && value.length === e.target.maxLength) {
                        phone3Ref.current?.focus();
                      }
                    }}
                    className="w-20"
                  />
                  <span className="self-center">-</span>
                  <Input
                    id="phone3"
                    name="phone3"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="\d{4}"
                    placeholder="5678"
                    required
                    value={phone3}
                    ref={phone3Ref}
                    onChange={e => setPhone3(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-20"
                  />
                </div>
                {/* 필드별 오류 메시지 */}
                {state?.error?.fields?.phone && (
                  <p className="text-sm text-red-600">
                    {state.error.fields.phone[0]}
                  </p>
                )}
              </div>

              {/* 이용약관 동의 체크박스 */}
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mr-2 w-4 h-4 accent-blue-600"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-700 select-none">
                  <span className="font-semibold text-blue-700">이용약관</span>에 동의합니다.
                </label>
              </div>
              {/* 이용약관 동의 오류 메시지 */}
              {agreeTermsError && (
                <Alert className="mb-4" variant="destructive">
                  <AlertDescription>{agreeTermsError}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className={`w-full ${paymentVerified ? 'bg-green-600 hover:bg-green-700' : ''}`}
                disabled={false}
              >
                {paymentVerified ? "✓ 회원가입" : "본인인증 후 회원가입"}
              </Button>
              
              {/* 본인인증 상태 디버깅 정보 */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400 mt-2 text-center">
                  Debug: paymentVerified = {paymentVerified.toString()}
                </div>
              )}
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  로그인하기
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
