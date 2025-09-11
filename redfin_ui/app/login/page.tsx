"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, Eye, EyeOff, ArrowLeft, Database, HardDrive, Chrome } from "lucide-react";
import Link from "next/link";

// 카카오 아이콘 컴포넌트
const KakaoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C6.486 2 2 5.589 2 10.007c0 2.953 1.904 5.53 4.63 6.91-1.242 2.723-3.833 3.893-3.833 3.893s1.635-.493 3.833-1.947c1.132.343 2.32.537 3.537.537 5.514 0 10-3.589 10-8.007S17.514 2 12 2z" />
  </svg>
);

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [dbStatus, setDbStatus] = useState<'checking' | 'mariadb' | 'memory' | 'unknown'>('checking');
  const router = useRouter();
  const { login, user, isLoading: authLoading } = useAuth();

  // Google Identity Services를 위한 ref
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  // 이미 로그인된 상태라면 메인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, router, authLoading]);

  // Google Identity Services 초기화
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID가 설정되어 있지 않습니다. 구글 로그인 버튼 렌더링을 건너뜁니다.");
      return;
    }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

    const onLoad = () => {
      try {
        // @ts-ignore - 전역 google 객체 사용
        const google = (window as any).google;
        if (!google?.accounts?.id) return;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            try {
              const credential: string | undefined = response?.credential;
              if (!credential) return;

              const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential }),
              });

              const result = await res.json();
              console.log('구글 로그인 백엔드 응답:', result); // 응답 전체 출력
              if (res.ok && result.token && result.user) {
                // 로그인 성공 처리: AuthContext 업데이트
                login(result.token, result.user);
                router.push("/");
              } else {
                setError(result?.message || "구글 로그인에 실패했습니다.");
              }
            } catch (err) {
              console.error("구글 로그인 처리 오류:", err);
              setError("구글 로그인 처리 중 오류가 발생했습니다.");
            }
          },
          auto_select: false,
          ux_mode: "popup",
          context: "signin",
        });

        if (googleBtnRef.current) {
          google.accounts.id.renderButton(googleBtnRef.current, {
            type: "standard",
            theme: "filled_blue",
            text: "signin_with",
            shape: "rectangular",
            size: "large",
            logo_alignment: "left",
          });
        }
      } catch (e) {
        console.error("Google Identity 초기화 오류", e);
      }
    };

    if (existing) {
      if ((existing as HTMLScriptElement).getAttribute("data-loaded")) {
        onLoad();
      } else {
        existing.addEventListener('load', onLoad);
      }
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        script.setAttribute("data-loaded", "true");
        onLoad();
      };
      document.body.appendChild(script);

      return () => {
        script.onload = null;
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
  }, [login, router]);

  // 컴포넌트 마운트 시 데이터베이스 상태 확인
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('서버 상태:', data);

          if (data.database?.includes('MariaDB')) {
            setDbStatus('mariadb');
          } else if (data.database?.includes('메모리')) {
            setDbStatus('memory');
          } else {
            setDbStatus('unknown');
          }
        } else {
          setDbStatus('unknown');
        }
      } catch (error) {
        console.log('서버 연결 확인 중 오류:', error);
        setDbStatus('unknown');
      }
    };

    checkDbStatus();

    const timer = setTimeout(() => {
      setDbStatus(prev => prev === 'checking' ? 'unknown' : prev);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 구글 로그인 핸들러
  const handleGoogleLogin = () => {
    try {
      // @ts-ignore - 전역 google 객체 사용
      const google = (window as any).google;
      if (google?.accounts?.id) {
        google.accounts.id.prompt();
      } else {
        setError('구글 로그인 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      setError('구글 로그인 중 오류가 발생했습니다.');
    }
  };

  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    // 카카오 OAuth 인증 페이지로 리다이렉트
    const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const kakaoRedirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(kakaoRedirectUri)}`;
    window.location.href = kakaoAuthUrl;
  };

  // 리다이렉트 후 code 파라미터가 있으면 백엔드로 전달
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setIsLoading(true);
      fetch('/api/auth/kakao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
        .then(res => res.json())
        .then(result => {
          if (result.success && result.token && result.user) {
            login(result.token, result.user);
            router.push('/');
          } else {
            setError(result?.message || '카카오 로그인에 실패했습니다.');
          }
        })
        .catch(error => {
          setError('카카오 로그인 중 오류가 발생했습니다.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [login, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return false;
    }
    if (formData.password.length < 3) {
      setError("비밀번호는 3자 이상이어야 합니다.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      console.log('로그인 시도:', formData.email);

      // Next.js API 라우트 호출
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();
      console.log('로그인 응답:', response.status, result);

      // 응답에서 데이터베이스 상태 확인
      if (result.message) {
        if (result.message.includes('MariaDB')) {
          setDbStatus('mariadb');
        } else if (result.message.includes('메모리')) {
          setDbStatus('memory');
        }
      }

      if (response.ok && result.token && result.user) {
        console.log('로그인 성공, AuthContext 업데이트');

        // AuthContext의 login 함수 호출
        login(result.token, result.user);

        // 성공 메시지 표시
        const dbType = dbStatus === 'mariadb' ? 'MariaDB' : '메모리 기반';
        console.log(`로그인 성공 (${dbType})`);

        // 메인 페이지로 리다이렉트
        router.push('/');
      } else {
        setError(result.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setError("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setDbStatus('unknown');
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중이면 로딩 화면 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">인증 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">로그인</CardTitle>
              {/* 데이터베이스 상태 표시 */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {dbStatus === 'mariadb' && (
                  <>
                    <Database className="w-3 h-3" />
                    <span>MariaDB</span>
                  </>
                )}
                {dbStatus === 'memory' && (
                  <>
                    <HardDrive className="w-3 h-3" />
                    <span>메모리</span>
                  </>
                )}
                {dbStatus === 'checking' && (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>확인중</span>
                  </>
                )}
              </div>
            </div>
            <CardDescription className="text-center">
              계정에 로그인하여 서비스를 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 오류 메시지 */}
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 소셜 로그인 버튼들 */}
            <div className="space-y-3 mb-6">
              {/* Google 로그인 버튼 */}
              <div className="space-y-2">
                <div ref={googleBtnRef} className="w-full" />
              </div>

              {/* 카카오 로그인 버튼 */}
              <Button
                onClick={handleKakaoLogin}
                className="w-full bg-[#FEE500] text-black hover:bg-[#FEE500]/90 transition-all duration-200"
                disabled={isLoading}
              >
                <KakaoIcon className="w-5 h-5 mr-2" />
                카카오로 로그인
              </Button>

              {/* 구분선 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">또는</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="test@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="pr-10 transition-all duration-200"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3">


              <div className="text-center">
                <p className="text-sm text-gray-600">
                  계정이 없으신가요?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    회원가입하기
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

  );
}
