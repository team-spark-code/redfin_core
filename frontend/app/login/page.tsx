"use client";

import { login } from "@/lib/actions/user";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useEffect } from "react";

// 폼 제출 버튼 컴포넌트 (로딩 상태 표시)
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
    >
      {pending ? "로그인 중..." : "로그인"}
    </button>
  );
}

export default function LoginPage() {
  // useFormState를 사용하여 서버 액션의 상태를 관리
  const [state, formAction] = useFormState(login, { error: undefined });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      fetch("/api/auth/kakao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.token && result.user) {
            // 로그인 성공 시 원하는 처리 (예: 세션 저장, 리다이렉트 등)
            window.location.href = "/";
          } else {
            alert(result?.message || "카카오 로그인에 실패했습니다.");
          }
        })
        .catch(() => {
          alert("카카오 로그인 중 오류가 발생했습니다.");
        });
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          로그인
        </h1>

        {/* 오류 메시지 */}
        {state?.error && (
          <div className="p-4 text-red-700 bg-red-100 border border-red-300 rounded-md">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              이메일 주소
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <SubmitButton />
        </form>

        {/* 카카오 로그인 버튼 */}
        <button
          type="button"
          className="w-full px-6 py-3 mt-2 text-black bg-[#FEE500] rounded-md hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          onClick={() => {
            const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
            const kakaoRedirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
            const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(kakaoRedirectUri)}`;
            window.location.href = kakaoAuthUrl;
          }}
        >
          카카오로 로그인
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              회원가입하기
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
