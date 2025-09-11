import { NextRequest, NextResponse } from "next/server";

// JWT 토큰 생성 함수 예시 (실제 구현 시 secret 환경변수 사용)
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  // 프론트엔드에서 code를 받아야 함
  const { code } = body as { code?: string };
  if (!code) {
    return NextResponse.json({
      success: false,
      message: "카카오 인증 코드가 필요합니다."
    }, { status: 400 });
  }

  // 카카오 토큰 요청
  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_CLIENT_ID!,
      client_secret: process.env.KAKAO_CLIENT_SECRET!,
      redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!, // 수정됨
      code
    })
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.json({
      success: false,
      message: "카카오 토큰 획득에 실패했습니다.",
      detail: tokenData
    }, { status: 400 });
  }

  // 카카오 사용자 정보 요청
  const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });
  const userData = await userRes.json();

  // 사용자 정보 추출
  const kakaoAccount = userData.kakao_account || {};
  const profile = kakaoAccount.profile || {};
  const user = {
    id: userData.id,
    email: kakaoAccount.email || null,
    name: profile.nickname || kakaoAccount.name || "Kakao User",
    provider: "kakao",
    profile_image: profile.profile_image_url || null
  };

  // JWT 토큰 생성
  const token = jwt.sign({
    userId: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider
  }, JWT_SECRET, { expiresIn: "7d" });

  return NextResponse.json({
    success: true,
    token,
    user
  });

}

export async function GET() {
  return NextResponse.json({
    message: "카카오 로그인 API 엔드포인트입니다."
  });
}
