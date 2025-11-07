# GitHub 이슈: 정부지원사업 필터링/요약 웹사이트

아래 내용을 복사해서 GitHub에서 이슈를 생성하세요:
- 저장소: https://github.com/jagers-ai/grants/issues/new

---

**Title:**
```
프로젝트 계획: 정부지원사업 필터링/요약 웹사이트
```

**Labels:** `enhancement`, `documentation`

**Body:**
```markdown
## 📋 프로젝트 개요

정부지원사업 API를 활용하여 1000개가 넘는 정부지원사업을 필터링하고 AI로 요약하는 웹사이트 개발 프로젝트입니다.

### 🎯 핵심 가치
> "내게 맞는 정부지원사업을 빠르게 찾고, AI가 핵심만 요약해주는 서비스"

---

## 🛠 기술 스택

- **Frontend**: Next.js 14 + shadcn/ui + Tailwind CSS
- **Backend**: Next.js API Routes + PostgreSQL + Prisma
- **AI**: Claude API (요약 기능)
- **Cache**: Redis
- **Hosting**: Vercel + Supabase

---

## 📅 개발 로드맵

### Phase 1: MVP (4-6주)
- 프로젝트 초기화 및 API 연동
- 기본 UI/UX 구현
- 필터링 및 검색 기능

### Phase 2: AI 요약 (2-3주)
- Claude API 통합
- 공고문 요약 기능
- UI 개선

### Phase 3: 사용자 기능 (3-4주)
- 회원 인증 및 북마크
- 알림 시스템
- 맞춤 추천

---

## 📊 주요 기능

### ✅ Phase 1 (MVP)
- [ ] 고급 필터링 (지원대상, 분야, 예산, 기간, 지역)
- [ ] 키워드 검색 및 자동완성
- [ ] 사업 상세 정보 표시

### 🤖 Phase 2 (AI)
- [ ] AI 기반 공고 요약 (3-5개 핵심 포인트)
- [ ] 자동 정보 추출 (지원대상, 금액, 기한)
- [ ] 맞춤 추천 시스템

### 👤 Phase 3 (사용자)
- [ ] 북마크 및 저장
- [ ] 마감 알림 (D-7, D-3, D-1)
- [ ] 사업 비교 기능

---

## 🔗 참고 자료

상세한 프로젝트 계획서는 [PROJECT_PLAN.md](../blob/claude/update-model-sonnet-4.5-011CUsy7k4SGWiRPco56N4z6/PROJECT_PLAN.md)를 참조하세요.

### API 소스
- **K-Startup API** (공공데이터포털)
  - 엔드포인트: 공고정보, 사업정보, 통계 등
  - 무료 10,000건/월
- **중소벤처24** 공고정보 API
- **Bizinfo** 데이터 (2025년: 429개 프로그램, 3.294조원)

---

## 💰 예상 비용

| 항목 | 서비스 | 비용 |
|------|--------|------|
| 호스팅 | Vercel | $0-20/월 |
| 데이터베이스 | Supabase | $0-25/월 |
| 캐시 | Redis | $0 |
| AI API | Claude | $10-30/월 |

**총 예상: $10-55/월**

---

## 🚀 다음 단계

### 즉시 시작 가능한 작업

1. [ ] 공공데이터포털에서 API 키 발급
2. [ ] Next.js 프로젝트 초기화
3. [ ] Supabase DB 세팅
4. [ ] K-Startup API 테스트 스크립트 작성
5. [ ] 기본 UI 프로토타입 개발

### 상세 작업 (Week 1-2)
- [ ] Next.js + TypeScript 프로젝트 세팅
- [ ] Prisma 스키마 작성 및 마이그레이션
- [ ] 배치 동기화 스크립트 (API → DB)
- [ ] 초기 데이터 수집 (최소 500개 사업)

---

## ⚠️ 주요 리스크 및 해결책

### API 호출 제한
- 문제: 월 10,000건 제한
- 해결: 하루 1회 배치 동기화 + Redis 캐싱

### AI 요약 비용
- 문제: 요청당 비용 발생
- 해결: 신규 공고만 처리 + Haiku 모델 사용

### 데이터 정합성
- 문제: API 데이터 형식 불규칙
- 해결: 검증 레이어 + 에러 로깅

---

**예상 완료**: 10-13주
**우선순위**: High
**관련 브랜치**: `claude/update-model-sonnet-4.5-011CUsy7k4SGWiRPco56N4z6`
```
