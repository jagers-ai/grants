# K-Startup 조회수 크롤러 계획

## 목표
- K-Startup 지원사업에 대한 조회수(viewCount)를 수집해 `Program.viewCount`에 저장하고, 기존 조회수 정렬/표시 정책과 일관되게 노출한다.

## 할 일
1. **조회수 필드 소스 확인**: 공식 API에 조회수 필드가 있는지 확인하고, 없다면 공고 상세 HTML 크롤링으로 조회수 추출 경로를 결정한다.
2. **파싱/에러 처리**: 숫자 변환 실패 시 `null` 저장, 타임아웃/파싱 실패 시 경고 로그 후 다음 항목 진행.
3. **파이프라인 반영**: `fetchKStartupData`에서 `viewCount`를 매핑하고 `ingest` upsert에 포함.
4. **정렬/표시 검토**: 전체 목록 정렬(viewCount desc, null은 최하단)과 Bizinfo와 동일한 UI 정책 유지.

## 노트
- 현재 Bizinfo는 `inqireCo`를 `viewCount`로 저장 중이며, K-Startup도 동일 필드에 적재해 정렬/표시를 공유한다.
- 조회수 미제공 시 `null`로 저장하고 UI는 \"null\" 텍스트로 표시한다(정렬상 최하단).
