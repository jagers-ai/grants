# Grants (Option B: Next.js + Prisma SQLite)

개인 로컬 사용을 전제로 한 POC입니다. 나중에 배포(Postgres)로 전환을 쉽게 하기 위해 `prisma/schema.pg.prisma`도 함께 제공합니다.

## 빠른 시작

1) 의존성 설치

```
npm i
```

2) .env 설정(로컬 SQLite)

```
cp .env.example .env
```

3) Prisma 마이그레이션 + Client 생성

```
npm run prisma:migrate
npm run prisma:generate
```

4) 더미 데이터 추가(선택)

```
npm run seed
# 또는
npm run ingest
```

5) 개발 서버 실행

```
npm run dev
# http://localhost:3000
```

### (선택) grants alias로 실행

매번 디렉터리로 이동하지 않고 바로 개발 서버를 띄우고 싶다면, 쉘 설정 파일(`~/.bashrc`, `~/.zshrc` 등)에 아래와 같이 alias를 추가해서 사용할 수 있습니다.

```bash
# 예시: 로컬 grants 프로젝트를 한 번에 실행
alias grants='(cd ~/projects/grents && npm run dev)'

# 이후에는 터미널에서 다음과 같이 실행
# $ grants
```

## 스키마 모델

- Program: 기본 지원사업 엔티티(제목/요약/기간/링크/주관/금액 등)

## Postgres로 전환(배포 시)

- `prisma/schema.pg.prisma` 사용, `DATABASE_URL`을 Postgres로 교체
- 초기 스키마 SQL 생성
  - `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.pg.prisma --script > prisma/migrations/000_init/migration.sql`
- 배포 DB에 적용 후 `prisma generate`
- 필요하면 로컬 SQLite 데이터를 JSON 덤프 → 시드 스크립트로 이행

## 인제스트(POC)

- `scripts/ingest.js`는 더미 데이터를 추가하는 자리표시자입니다.
- 실제 연동 시 data.go.kr API 키를 `.env`의 `DATA_GO_KR_API_KEY`에 설정 후 구현하세요.
