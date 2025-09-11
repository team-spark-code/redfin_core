"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { InterestsSettingsPage } from "../components/InterestsSettingsPage";
import { useEffect } from "react";

export default function InterestsPage() {
  const { user, refreshUserFromMember } = useAuth(); // refreshUserFromMember 가져오기
  const router = useRouter();

  // 사용자가 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleBack = () => {
    router.back();
  };

  const handleUpdateInterests = async (interests: string[]) => {
    if (!user) return;

    try {
      // 1. AuthContext의 사용자 정보 새로고침 (관심사 포함)
      await refreshUserFromMember();
      console.log("관심사 저장 후 AuthContext가 성공적으로 새로고침되었습니다.");

      // 2. 사용자 경험을 위해 메인 페이지로 이동
      alert("관심사가 저장되었습니다. 메인 페이지에서 개인화된 뉴스를 확인하세요.");
      router.push('/');

    } catch (error) {
      console.error("관심사 업데이트 후 사용자 정보 새로고침 실패:", error);
      alert("관심사 저장에 성공했으나, 변경사항을 적용하는 데 실패했습니다. 페이지를 새로고침해주세요.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <InterestsSettingsPage
      onBack={handleBack}
      user={user}
      onUpdateInterests={handleUpdateInterests}
    />
  );
}
