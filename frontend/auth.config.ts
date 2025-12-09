import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // 로그인 페이지 경로 설정
  pages: {
    signIn: "/login",
  },
  // providers는 여기에 둘 수도 있고, 메인 auth.ts에 둘 수도 있습니다.
  // 미들웨어는 provider 로직이 필요 없으므로, 분리하는 것이 효율적입니다.
  providers: [
    // provider 설정은 비워둡니다. 실제 로직은 메인 auth.ts 파일에 있습니다.
  ],
} satisfies NextAuthConfig;
