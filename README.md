# AI 뉴스 개인화 서비스

이 프로젝트는 사용자에게 개인화된 AI 뉴스를 제공하는 웹 애플리케이션입니다. 이메일 및 소셜 로그인(Google, Kakao)을 통해 사용자를 인증하고, 등록된 관심사에 따라 맞춤화된 뉴스 피드를 제공합니다.

## 주요 기능

- **사용자 인증**: 이메일 기반 회원가입 및 로그인, Google 및 Kakao를 이용한 소셜 로그인 기능을 지원합니다.
- **관심사 기반 개인화**: 사용자는 직업, AI 기업, AI 기술 분야에 대한 자신의 관심사를 설정할 수 있습니다.
- **개인화된 뉴스 피드**: 메인 페이지는 사용자가 등록한 관심사를 기반으로 우선순위가 지정된 주요 기사와 함께 맞춤화된 뉴스 목록을 표시합니다.
- **동적 콘텐츠 로딩**: 내부 데이터베이스 및 외부 RSS 피드로부터 뉴스를 가져와 동적으로 표시합니다.
- **반응형 UI**: Next.js와 Tailwind CSS로 구축되어 다양한 기기에서 원활한 사용자 경험을 제공합니다.
- **본인인증 시스템**: 토스페이먼츠 결제 API를 활용한 실명 인증 기능
- **실시간 뉴스 검색**: Elasticsearch 기반의 빠른 뉴스 검색 및 필터링
- **다중 데이터베이스 지원**: MySQL과 MongoDB 연동으로 다양한 데이터 처리

## 현재 프로젝트 진행 상황

### ✅ 완료된 작업
- **기본 프로젝트 설정**: Next.js 14, TypeScript, Tailwind CSS 환경 구축
- **인증 시스템 구현**: 
  - 이메일 기반 회원가입/로그인
  - Google OAuth 2.0 연동
  - Kakao 소셜 로그인 연동
  - JWT 토큰 기반 세션 관리
- **데이터베이스 연동**: 
  - MySQL2를 활용한 사용자 정보 관리
  - MongoDB 연동 설정
  - Elasticsearch 검색 엔진 연동
- **UI/UX 구현**: 
  - shadcn/ui 기반 컴포넌트 라이브러리
  - 반응형 디자인 적용
  - 다크/라이트 테마 지원
- **뉴스 시스템**: 
  - RSS 피드 파싱 및 뉴스 수집
  - 카테고리별 뉴스 분류
  - 실시간 뉴스 업데이트
- **결제 연동**: 토스페이먼츠 본인인증 시스템 구현
- **검색 기능**: Elasticsearch 기반 뉴스 검색 및 필터링

### 🔄 진행 중인 작업
- **소셜 로그인 오류 수정**: 
  - Google 로그인 시 MEMBER 테이블 컬럼 불일치 문제 해결 필요
  - Kakao 로그인 API 연동 오류 수정 진행 중
- **데이터베이스 스키마 최적화**: 
  - MEMBER 테이블 구조 개선
  - 필드명 일치성 확보
- **에러 핸들링 개선**: 
  - API 응답 오류 처리 강화
  - 사용자 친화적 오류 메시지 개선

### 📋 예정된 작업
- **개인화 알고리즘 고도화**: 사용자 관심사 기반 뉴스 추천 시스템 개선
- **성능 최적화**: 
  - 이미지 최적화 및 지연 로딩
  - API 응답 시간 개선
  - 캐싱 전략 도입
- **모바일 최적화**: PWA(Progressive Web App) 기능 추가
- **알림 시스템**: 실시간 뉴스 알림 및 이메일 뉴스레터
- **관리자 대시보드**: 뉴스 관리 및 사용자 통계 대시보드
- **다국어 지원**: 한국어 외 영어 지원 추가

## 기술적 특징

### 아키텍처
- **프론트엔드**: Next.js 14 App Router를 활용한 서버사이드 렌더링
- **상태 관리**: React Context API를 통한 전역 상태 관리
- **API 설계**: RESTful API 구조로 백엔드 연동
- **데이터베이스**: 관계형(MySQL)과 비관계형(MongoDB) 데이터베이스 하이브리드 활용

### 보안 및 인증
- **JWT 토큰**: 안전한 사용자 인증 및 세션 관리
- **OAuth 2.0**: Google, Kakao 소셜 로그인 보안 표준 준수
- **환경 변수**: 민감한 정보의 안전한 관리
- **본인인증**: 토스페이먼츠 결제 API를 통한 실명 확인

### 성능 최적화
- **서버사이드 렌더링**: SEO 최적화 및 초기 로딩 속도 개선
- **코드 분할**: 페이지별 번들 최적화
- **이미지 최적화**: Next.js Image 컴포넌트 활용

## 알려진 이슈 및 해결 방안

### 현재 해결 중인 문제
1. **구글 로그인 오류**: 
   - 문제: MEMBER 테이블에 'zip_code', 'bio' 컬럼 누락
   - 해결 방안: 데이터베이스 스키마 업데이트 필요

2. **카카오 로그인 오류**: 
   - 문제: JSON 파싱 오류 및 인증 코드 처리 문제
   - 해결 방안: API 응답 처리 로직 개선 및 에러 핸들링 강화

3. **TypeScript 컴파일 오류**: 
   - 문제: await 키워드 사용 시 async 함수 선언 누락
   - 해결 방안: 함수 타입 정의 및 비동기 처리 개선

### 향후 개선 계획
- 데이터베이스 마이그레이션 스크립트 작성
- API 에러 응답 표준화
- 단위 테스트 및 통합 테스트 추가
- 성능 모니터링 시스템 도입

## 기술 스택

- **프론트엔드**: Next.js (React)
  - next: 14.2.31
  - react: 18.3.1
  - react-dom: 18.3.1
- **타입스크립트**: typescript: 5.9.2
- **스타일링**: Tailwind CSS: 4.1.12, postcss: 8.5.6
- **상태 관리**: React Context API (`AuthContext`)
- **UI 컴포넌트 및 아이콘**: shadcn/ui, lucide-react: 0.540.0
- **백엔드 통신**: fetch, undici: 7.15.0
- **인증**: JWT (jsonwebtoken: 9.0.2), Google Identity Services (google-auth-library: 10.3.0), Kakao Login API
- **데이터베이스**: mysql2: 3.14.4, mongodb: 6.19.0
- **결제 연동**: @tosspayments/integration-guide-mcp: 최신 설치 버전
- **기타 주요 라이브러리**: zod: 4.1.5, nodemailer: 7.0.6, fast-xml-parser: 5.2.5, xml2js: 0.6.2
- **Node.js**: v22.18.0
- **npm**: 10.9.3

## 폴더 구조

```
/app
├── api/                # API 라우트 (인증, 뉴스 등)
├── components/         # 재사용 가능한 React 컴포넌트
├── contexts/           # 전역 상태 관리 (예: AuthContext)
├── (routes)/           # 페이지 라우트 (예: 로그인, 회원가입, 관심사 설정)
└── layout.tsx          # 메인 레이아웃
/lib
├── actions/            # 서버 사이드 액션 (예: 사용자 가입)
├── database.ts         # 데이터베이스 연결 및 쿼리 함수
└── categoryStyle.ts    # 뉴스 카테고리 스타일 정의
/public
└── ...                 # 정적 파일 (이미지, 폰트)
```

## 시작하기

### 사전 요구사항

- Node.js
- pnpm (또는 npm/yarn)
- MariaDB (또는 호환되는 다른 데이터베이스)
- **Elasticsearch**: 백엔드(Spring Boot)가 정상적으로 작동하려면 
  -                     Elasticsearch가 9200번 포트에서 실행 중이어야 합니다.

### 설치

1. 레포지토리를 클론합니다:
   ```bash
   git clone <repository-url>
   ```
2. 프로젝트 디렉터리로 이동합니다:
   ```bash
   cd redfin_ui
   ```
3. 의존성을 설치합니다:
   ```bash
   pnpm install
   ```

### 애플리케이션 실행

1. 아래 설명에 따라 필요한 환경 변수를 설정합니다.
2. 개발 서버를 시작합니다:
   ```bash
   pnpm dev
   ```
3. 브라우저를 열고 `http://localhost:3000`으로 이동합니다.

## 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 추가하세요. 이 변수들은 인증 및 백엔드 API 통신에 필수적입니다.

```
# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Kakao OAuth
NEXT_PUBLIC_KAKAO_CLIENT_ID=your-kakao-rest-api-key
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/signup

# 백엔드 API 서버
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# 데이터베이스 (MariaDB)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

**참고**: `NEXT_PUBLIC_KAKAO_REDIRECT_URI`는 카카오 개발자 콘솔에 등록된 Redirect URI와 반드시 일치해야 합니다.
