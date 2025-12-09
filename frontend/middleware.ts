import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// authConfig에서 auth 함수를 가져와 미들웨어로 사용
export default NextAuth(authConfig).auth;

// 미들웨어가 적용될 경로를 설정
export const config = {
  // matcher에 포함된 경로는 미들웨어의 보호를 받음
  matcher: ["/members/:path*"],
};
