# RedFin Core

RedFin 프로젝트의 핵심 컴포넌트 및 데모 애플리케이션을 포함하는 디렉토리입니다.

## 📁 프로젝트 구조

```
redfin_core/
├── demo/                    # Spring Boot + Next.js 하이브리드 데모 프로젝트
│   ├── src/                 # Spring Boot 백엔드 (Java)
│   │   └── main/java/       # 회원 관리, 검색, RSS 처리 등
│   ├── app/                 # Next.js 프론트엔드 (TypeScript)
│   └── README.md            # 데모 프로젝트 상세 문서
├── docs/                    # 문서 디렉토리
└── README.md                # 본 문서
```

## 🎯 주요 하위 프로젝트

### demo/
Spring Boot와 Next.js를 결합한 하이브리드 데모 애플리케이션입니다.

**주요 기능:**
- 회원 가입, 로그인, 프로필 관리
- Elasticsearch 기반 고속 검색 및 JPA fallback
- 회원 관심사 관리 (직업, AI 기업, AI 기술 분야)
- RSS 피드 수집 및 처리
- OAuth 2.0 소셜 로그인 (Google, Kakao)

**기술 스택:**
- **백엔드**: Spring Boot, Spring Data JPA, Spring Data Elasticsearch, Spring Security
- **프론트엔드**: Next.js 14, TypeScript, Tailwind CSS
- **데이터베이스**: MySQL/MariaDB, Elasticsearch, MongoDB

자세한 내용은 [`demo/README.md`](./demo/README.md)를 참조하세요.

## 🚀 시작하기

### demo 프로젝트 실행

1. **Elasticsearch 실행**
   ```bash
   # Elasticsearch가 9200번 포트에서 실행 중이어야 합니다
   # Windows: D:\member_rss0825\elasticsearch-8.10.4\bin\elasticsearch.bat
   # Linux/macOS: ./elasticsearch-8.10.4/bin/elasticsearch
   ```

2. **Spring Boot 백엔드 실행**
   ```bash
   cd demo
   ./gradlew bootRun
   ```

3. **Next.js 프론트엔드 실행** (별도 터미널)
   ```bash
   cd demo
   pnpm install
   pnpm dev
   ```

## 📝 참고 문서

- **UI 프로젝트**: 프로젝트 루트의 [`/redfin_ui`](../redfin_ui/README.md) 참조
- **토스페이먼츠 연동**: [`docs/llms_tosspayments.md`](./docs/llms_tosspayments.md)
- **데모 프로젝트**: [`demo/README.md`](./demo/README.md)

## 🔗 관련 프로젝트

- **redfin_ui**: 메인 UI 프로젝트 - [로컬 경로](../redfin_ui) | [GitHub](https://github.com/{username}/redfin/tree/main/redfin_ui)
- **redfin_api**: FastAPI 기반 백엔드 API - [로컬 경로](../redfin_api) | [GitHub](https://github.com/{username}/redfin/tree/main/redfin_api)
- **redfin_airflow**: Airflow 기반 데이터 파이프라인 - [로컬 경로](../redfin_airflow) | [GitHub](https://github.com/{username}/redfin/tree/main/redfin_airflow)
- **redfin_rag**: RAG (Retrieval-Augmented Generation) 시스템 - [로컬 경로](../redfin_rag) | [GitHub](https://github.com/{username}/redfin/tree/main/redfin_rag)
- **redfin_infra**: 인프라 설정 및 배포 스크립트 - [로컬 경로](../redfin_infra) | [GitHub](https://github.com/{username}/redfin/tree/main/redfin_infra)

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**개발팀**: RedFin Team  
**최종 업데이트**: 2025년 1월
