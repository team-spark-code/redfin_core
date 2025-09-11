import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { testConnection, findUserByEmail as dbFindUserByEmail, createUser as dbCreateUser } from "../../../lib/database";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();
    if (!credential) {
      return NextResponse.json({ message: "credential(ID 토큰)이 없습니다." }, { status: 400 });
    }
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json({ message: "GOOGLE_CLIENT_ID 환경변수가 없습니다." }, { status: 500 });
    }

    // 구글 ID 토큰 검증
    const ticket = await oauthClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json({ message: "구글 토큰 검증 실패" }, { status: 401 });
    }

    const email = payload.email || "";
    const name = payload.name || payload.given_name || "Google User";
    const emailVerified = payload.email_verified;
    const picture = payload.picture || null;
    const googleId = payload.sub || null;

    if (!email || !emailVerified) {
      return NextResponse.json({ message: "이메일 정보가 없거나 검증되지 않았습니다." }, { status: 400 });
    }

    // DB 연결 여부 확인
    const isDbConnected = await testConnection();

    if (!isDbConnected) {
      // 메모리 폴백
      const { findUserByEmail: memoryFindUser, createUser: memoryCreateUser } = await import("../../../lib/userData");

      let user = memoryFindUser(email);
      if (!user) {
        console.log(`구글 로그인: 새 사용자 생성 중 (메모리) - ${email}`);
        user = memoryCreateUser({ 
          email, 
          name, 
          password: "google-oauth",
          provider: "google",
          googleId: googleId
        });
        console.log(`구글 로그인: 사용자 생성 완료 (메모리) - ID: ${user.id}`);
      } else {
        console.log(`구글 로그인: 기존 사용자 로그인 (메모리) - ID: ${user.id}`);
      }

      const token = jwt.sign(
        { userId: user.id, memberId: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const userResponse = {
        ...user,
        memberId: user.id,
        username: user.name,
      };

      return NextResponse.json({ message: "구글 계정으로 로그인/가입 완료 (메모리)", token, user: userResponse });
    }

    // DB 사용 경로
    let user = await dbFindUserByEmail(email);
    if (!user) {
      console.log(`구글 로그인: MEMBER 테이블에 새 사용자 생성 중 - ${email}`);
      
      const created = await dbCreateUser({
        email,
        name,
        password: "google-oauth", // 구글 OAuth 사용자임을 표시
        phone: null as any,
        zipcode: null as any,
        address: null as any,
        detailAddress: null as any,
        bio: `구글 계정으로 가입한 사용자입니다. (${new Date().toLocaleDateString('ko-KR')})`,
      });
      
      if (!created) {
        console.error(`구글 로그인: 사용자 생성 실패 - ${email}`);
        return NextResponse.json({ message: "사용자 생성에 실패했습니다." }, { status: 500 });
      }
      
      user = created;
      console.log(`구글 로그인: MEMBER 테이블에 사용자 생성 완료 - ID: ${user.id}, 이메일: ${email}`);
    } else {
      console.log(`구글 로그인: 기존 MEMBER 사용자 로그인 - ID: ${user.id}, 이메일: ${email}`);
    }

    const token = jwt.sign(
      { userId: user.id, memberId: user.id, email: user.email, name: user.name, zipcode: (user as any).zipcode },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = {
      ...user,
      id: user.id,
      memberId: user.id,
      email: user.email,
      name: user.name,
      username: (user as any).username || user.name,
    };

    return NextResponse.json({ message: "구글 계정으로 로그인/가입 완료 (MariaDB)", token, user: userResponse });
  } catch (error) {
    console.error("/api/auth/google 오류:", error);
    return NextResponse.json({ message: "구글 인증 처리 중 서버 오류" }, { status: 500 });
  }
}

