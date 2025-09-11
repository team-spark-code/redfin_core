"use client";

import { SignupWithPayment } from "../components/SignupWithPayment";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  const handleSignupComplete = (userData: any) => {
    console.log('회원가입 완료:', userData);
    // 회원가입 완료 후 추가 처리 (예: 분석 이벤트 전송)
    
    // 3초 후 로그인 페이지로 이동
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  };

  return (
    <SignupWithPayment 
      onBack={handleBack}
      onComplete={handleSignupComplete}
    />
  );
}
