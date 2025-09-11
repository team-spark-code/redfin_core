import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 임시 사용자 데이터베이스 (실제로는 데이터베이스를 사용해야 함)
const users: Array<{ 
  id: number; 
  email: string; 
  fullName: string; 
  password: string;
  phoneNumber?: string;
  isVerified?: boolean;
  paymentAuth?: any;
}> = [
  {
    id: 1,
    email: "test@example.com",
    fullName: "Test User",
    password: "password", // 임시로 평문 비밀번호 사용
  },
];
let nextUserId = 2;

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface SignupRequestBody {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
  paymentAuth?: {
    orderId: string;
    amount: number;
    customerKey?: string;
    verifiedAt?: string;
    verified?: boolean;
    skippedAt?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequestBody = await request.json();
    const {
      email,
      password,
      fullName,
      phoneNumber,
      agreeToTerms,
      agreeToMarketing,
      paymentAuth
    } = body;

    // 필수 필드 검증
    if (!fullName || !email || !password || !agreeToTerms) {
      return NextResponse.json(
        { message: "필수 정보를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "올바른 이메일 형식을 입력해주세요." },
        { status: 400 }
      );
    }

    // 비밀번호 강도 검증
    if (password.length < 8) {
      return NextResponse.json(
        { message: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 이메일 중복 검사
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: "이미 가입된 이메일입니다." },
        { status: 409 }
      );
    }

    // 비밀번호 해시화
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 새 사용자 생성
    const newUser = {
      id: nextUserId++,
      email,
      fullName,
      phoneNumber: phoneNumber || undefined,
      password: hashedPassword,
      isVerified: paymentAuth ? !!paymentAuth.verified : false,
      paymentAuth: paymentAuth || undefined,
      agreeToTerms,
      agreeToMarketing,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        fullName: newUser.fullName,
        isVerified: newUser.isVerified
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = newUser;

    // 결제 인증 완료 로그
    if (paymentAuth && paymentAuth.verified) {
      console.log('결제 인증 완료:', {
        userId: newUser.id,
        orderId: paymentAuth.orderId,
        amount: paymentAuth.amount
      });
    }

    return NextResponse.json({
      message: "회원가입이 완료되었습니다.",
      token,
      user: userWithoutPassword,
    }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
