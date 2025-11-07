# 정부지원사업 필터링/요약 웹사이트 프로젝트 계획서

## 📊 1. API 조사 결과

### 사용 가능한 API 소스

#### A. K-Startup API (공공데이터포털)

**엔드포인트**:
1. `getAnnouncementInformation01` - 지원사업 공고
2. `getBusinessInformation01` - 통합 사업정보
3. `getContentInformation01` - 정책/트렌드/사례
4. `getStatisticalInformation01` - 통계 리포트

**제공 데이터**:
- 모집상태, 지원대상, 사업기간, 연령대, 지원분야
- 신청기간, 연락처, 신청방법

**기술 스펙**:
- 인증: serviceKey 필요 (공공데이터포털 발급)
- 요청 제한: 무료 10,000건/월
- 포맷: JSON, XML
- Base URL: `https://apis.data.go.kr/B552735/kisedKstartupService01/`

#### B. 중소벤처24 공고정보 API
- 공고명, 기간, 지원기관, 신청현황, 첨부파일

#### C. Bizinfo 데이터
- 창업, 중소기업 기술개발, 융자, 상용화 등
- 2025년: 101개 기관, 429개 프로그램, 총 3.294조원

---

## 🎯 2. 프로젝트 요구사항 및 핵심 기능

### 2.1 핵심 가치 제안
> "1000개가 넘는 정부지원사업 중에서 내게 맞는 사업을 빠르게 찾고, AI가 요약해주는 서비스"

### 2.2 주요 기능

#### Phase 1: MVP (필수 기능)

**1. 고급 필터링**
- 지원대상 (예비창업자, 1년 미만, 7년 미만 등)
- 지원분야 (기술개발, 상용화, 융자, 시설 등)
- 예산규모 (1억 이하, 1-5억, 5억 이상 등)
- 신청기간 (현재 진행 중, 곧 마감, 예정)
- 지역 (서울, 경기, 전국 등)

**2. 검색 기능**
- 키워드 검색 (사업명, 내용)
- 자동완성 및 추천 검색어

**3. 사업 상세 정보**
- 사업 개요, 지원내용, 신청방법
- 원본 공고 링크
- 담당기관 연락처

#### Phase 2: AI 요약 (차별화 기능)

**4. AI 기반 요약**
- 긴 공고문을 3-5개 핵심 포인트로 요약
- "누가 받을 수 있나요?", "얼마를 지원하나요?", "언제까지 신청하나요?" 자동 추출
- Claude API 또는 GPT 활용

**5. 맞춤 추천**
- 사용자 프로필 기반 (업종, 업력, 규모)
- 과거 관심사업 기반 추천

#### Phase 3: 사용자 기능

**6. 북마크 & 알림**
- 관심사업 저장
- 마감 D-7, D-3, D-1 알림
- 새 공고 알림 (필터 조건 기반)

**7. 비교 기능**
- 여러 사업을 나란히 비교
- 차이점 하이라이트

---

## 🛠 3. 기술 스택 및 아키텍처

### 3.1 추천 기술 스택

#### 프론트엔드
- **Framework**: Next.js 14 (App Router)
  - 이유: SEO 최적화, 서버 컴포넌트, 빠른 개발
- **UI Library**: shadcn/ui + Tailwind CSS
  - 이유: 모던한 디자인, 빠른 프로토타이핑
- **State Management**: React Query + Zustand
  - 이유: 서버 상태와 클라이언트 상태 분리
- **Form**: React Hook Form + Zod
  - 이유: 타입 안전한 폼 검증

#### 백엔드
- **API Layer**: Next.js API Routes (또는 별도 FastAPI)
  - 이유: Serverless, 간단한 배포
- **Database**: PostgreSQL + Prisma ORM
  - 이유: 관계형 데이터, 타입 안전성
- **Cache**: Redis (Vercel KV 또는 Upstash)
  - 이유: API 호출 제한 대응, 성능 향상
- **AI**: Claude API (Anthropic) 또는 OpenAI GPT-4
  - 이유: 한국어 요약 품질

#### 인프라
- **Hosting**: Vercel (프론트+API) + Supabase (DB)
  - 이유: 무료 티어, 자동 배포, 간편한 관리
- **Batch Jobs**: Vercel Cron (또는 GitHub Actions)
  - 이유: 주기적 데이터 동기화
- **Monitoring**: Sentry + Vercel Analytics

### 3.2 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                   사용자 (브라우저)                   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              Next.js Frontend (Vercel)              │
│  - React Components (검색, 필터, 상세페이지)           │
│  - Server Components (SEO 최적화)                    │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│            Next.js API Routes (Backend)             │
│  /api/grants - 사업 검색/필터                         │
│  /api/grants/[id] - 사업 상세                        │
│  /api/summarize - AI 요약                            │
│  /api/sync - 데이터 동기화 (Cron)                     │
└─────┬────────────┬────────────┬─────────────────────┘
      │            │            │
      ▼            ▼            ▼
┌──────────┐  ┌─────────┐  ┌──────────────┐
│PostgreSQL│  │  Redis  │  │  Claude API  │
│(Supabase)│  │ (Cache) │  │  (AI 요약)    │
└─────▲────┘  └─────▲───┘  └──────────────┘
      │             │
      │       ┌─────┴──────┐
      │       │ API 응답    │
      │       │ 캐싱 (24h) │
      │       └────────────┘
      │
┌─────┴────────────────────────────────────────┐
│          Batch Sync Job (매일 02:00)          │
│  - K-Startup API 호출                         │
│  - 중소벤처24 API 호출                         │
│  - DB 업데이트 (새 공고, 상태 변경)              │
└───────────────────────────────────────────────┘
```

### 3.3 데이터베이스 스키마 (초안)

```sql
-- 지원사업 테이블
CREATE TABLE grants (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(100) UNIQUE, -- API의 원본 ID
  title VARCHAR(500) NOT NULL,
  organization VARCHAR(200), -- 주관기관
  category VARCHAR(100), -- 기술개발, 융자, 상용화 등
  target_audience TEXT[], -- 지원대상 배열
  budget_min BIGINT, -- 최소 지원금액
  budget_max BIGINT, -- 최대 지원금액
  application_start DATE,
  application_end DATE,
  status VARCHAR(50), -- 접수중, 마감, 예정
  region VARCHAR(100),
  description TEXT, -- 원본 설명
  summary TEXT, -- AI 요약 (나중에 추가)
  url TEXT, -- 원본 공고 링크
  contact TEXT, -- 연락처
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 사용자 테이블 (Phase 3)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  profile JSONB, -- {업종, 업력, 규모 등}
  created_at TIMESTAMP DEFAULT NOW()
);

-- 북마크 테이블 (Phase 3)
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  grant_id INTEGER REFERENCES grants(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, grant_id)
);

-- 인덱스
CREATE INDEX idx_grants_status ON grants(status);
CREATE INDEX idx_grants_category ON grants(category);
CREATE INDEX idx_grants_app_end ON grants(application_end);
CREATE INDEX idx_grants_search ON grants USING gin(to_tsvector('korean', title || ' ' || description));
```

---

## 📅 4. 개발 로드맵

### Phase 1: MVP 개발 (4-6주)

#### Week 1-2: 프로젝트 세팅 & 데이터 수집
- [ ] Next.js + TypeScript 프로젝트 초기화
- [ ] Supabase DB 세팅 및 스키마 생성
- [ ] 공공데이터포털에서 API 키 발급
- [ ] 배치 스크립트 작성 (API → DB 동기화)
- [ ] 초기 데이터 수집 (최소 500개 사업)

#### Week 3-4: 기본 UI/UX 구현
- [ ] 메인 페이지 (검색 + 필터 UI)
- [ ] 사업 목록 페이지 (카드/테이블 뷰)
- [ ] 사업 상세 페이지
- [ ] 반응형 디자인 (모바일 대응)

#### Week 5-6: 필터링 & 검색 로직
- [ ] 다중 필터 구현 (지원대상, 분야, 예산, 기간)
- [ ] 키워드 검색 (PostgreSQL Full-text search)
- [ ] 정렬 기능 (마감임박순, 최신순, 지원금액순)
- [ ] 페이지네이션
- [ ] 성능 최적화 (Redis 캐싱)

### Phase 2: AI 요약 기능 (2-3주)

#### Week 7-8: AI 통합
- [ ] Claude API 또는 OpenAI API 연동
- [ ] 프롬프트 엔지니어링 (공고문 → 구조화된 요약)
- [ ] 요약 생성 API 엔드포인트 (`/api/summarize`)
- [ ] 요약 결과 DB 저장 (중복 요청 방지)
- [ ] 비용 최적화 (캐싱, 배치 처리)

#### Week 9: UI 개선
- [ ] 상세 페이지에 요약 섹션 추가
- [ ] "핵심 요약" 카드 디자인
- [ ] 로딩 상태 및 에러 처리

### Phase 3: 사용자 기능 (3-4주)

#### Week 10-11: 인증 & 북마크
- [ ] NextAuth.js 또는 Clerk 인증 연동
- [ ] 북마크 기능 (저장/삭제)
- [ ] 내 북마크 페이지

#### Week 12-13: 알림 & 추천
- [ ] 이메일 알림 (마감 임박, 새 공고)
- [ ] 사용자 프로필 기반 추천 알고리즘
- [ ] 푸시 알림 (선택사항)

---

## ⚠️ 5. 주요 고려사항 및 리스크

### 5.1 기술적 과제

#### 1. API 호출 제한 (월 10,000건)
- ✅ 해결책: 배치로 하루 1회 동기화 (월 ~30회)
- ✅ Redis 캐싱으로 실시간 조회는 DB에서

#### 2. AI 요약 비용
- ✅ 해결책: 신규 공고에만 요약 생성 (월 ~500건)
- ✅ Claude Haiku (저렴한 모델) 사용
- ✅ 예상 비용: $5-20/월

#### 3. 데이터 정합성
- ⚠️ 문제: 정부 API 데이터 형식이 불규칙할 수 있음
- ✅ 해결책: 데이터 검증 레이어, 에러 로깅

#### 4. 검색 성능
- ✅ 해결책: PostgreSQL Full-text search + 인덱스
- 또는 Algolia/MeiliSearch (나중에 고려)

### 5.2 법적/운영 고려사항

- **데이터 저작권**: 공공데이터는 자유 이용 가능 (출처 표시)
- **개인정보보호**: 사용자 데이터 최소화, GDPR/개인정보보호법 준수
- **서비스 안정성**: 정부 API 장애 시 대비 (캐시된 데이터 제공)

---

## 💰 6. 예상 비용 (월간)

| 항목 | 서비스 | 비용 |
|------|--------|------|
| 호스팅 | Vercel (Hobby) | $0 (또는 $20 Pro) |
| 데이터베이스 | Supabase (Free tier) | $0 (또는 $25) |
| 캐시 | Upstash Redis (Free) | $0 |
| AI 요약 | Claude API (Haiku) | $10-30 |
| 도메인 | .com | $12/년 |
| **합계** | | **~$10-55/월** |

---

## 🚀 7. 즉시 시작 가능한 옵션

### A. MVP 프로토타입 시작
Next.js 프로젝트 초기화 및 기본 구조 세팅

### B. API 테스트 먼저
K-Startup API를 테스트하는 스크립트 작성

### C. 데이터베이스 스키마 구현
Prisma 스키마 작성 및 마이그레이션 생성

### D. 배치 동기화 스크립트
정부 API에서 데이터를 가져와 DB에 저장하는 스크립트 작성

---

## 📌 핵심 요약

- **프로젝트 목표**: 1000개+ 정부지원사업을 AI로 요약하고 강력한 필터링 제공
- **개발 단계**: 3단계 (MVP → AI요약 → 사용자기능)
- **핵심 차별점**: AI 기반 공고 요약 + 고급 필터링
- **기술 스택**: Next.js + PostgreSQL + Redis + Claude API
- **예상 기간**: 10-13주
- **예상 비용**: 월 $10-55
