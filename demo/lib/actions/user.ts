"use server";

import { redirect } from "next/navigation";

// 백엔드 API 기본 URL
const API_BASE_URL = "http://localhost:8080/api";

export interface LoginResult {
  error?: string;
  success?: boolean;
}

export interface SignupResult {
  error?: {
    form?: string;
    fields?: Record<string, string[]>;
  };
  success?: string;
}

// Spring Boot 백엔드로 회원가입 요청
export async function signup(formData: FormData): Promise<SignupResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 기본적인 유효성 검사
  if (!name || name.length < 2) {
    return {
      error: {
        fields: { name: ["이름은 2자 이상이어야 합니다."] }
      }
    };
  }

  if (!email || !email.includes("@")) {
    return {
      error: {
        fields: { email: ["유효한 이메일을 입력해주세요."] }
      }
    };
  }

  if (!password || password.length < 6) {
    return {
      error: {
        fields: { password: ["비밀번호는 6자 이상이어야 합니다."] }
      }
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: name,
        email: email,
        password: password,
        phoneNumber: "" // 기본값
      }),
    });

    const result = await response.json();

    if (result.success) {
      return { success: "회원가입이 완료되었습니다. 이제 로그인할 수 있습니다." };
    } else {
      return { error: { form: result.message || "회원가입에 실패했습니다." } };
    }
  } catch (error) {
    console.error("회원가입 오류:", error);
    return { error: { form: "서버 연결에 실패했습니다. 다시 시도해주세요." } };
  }
}

// Spring Boot 백엔드로 로그인 요청
export async function login(prevState: any, formData: FormData): Promise<LoginResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해주세요." };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // 로그인 성공 시 사용자 정보를 세션에 저장하거나 쿠키에 저장
      // 여기서는 간단히 리다이렉트만 수행
      redirect("/");
    } else {
      return { error: result.message || "로그인에 실패했습니다." };
    }
  } catch (error) {
    console.error("로그인 오류:", error);
    return { error: "서버 연결에 ���패했습니다. 다시 시도해주세요." };
  }
}

// 로그아웃 (현재는 간단히 메인 페이지로 리다이렉트)
export async function logout() {
  redirect("/");
}

// 이메일 중복 확인
export async function checkEmailAvailability(email: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/check-email?email=${encodeURIComponent(email)}`, {
      method: "GET",
    });

    const result = await response.json();
    return !result.exists; // 존재하지 않으면 사용 가능
  } catch (error) {
    console.error("이메일 중복 확인 오류:", error);
    return false; // 오류 시 사용 불가능으로 처리
  }
}
