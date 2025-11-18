/**
 * TODO: AI 요약 기능 구현 시 활용할 타입 정의
 * 향후 OpenAI, Gemini, 또는 로컬 LLM으로 구조화된 요약을 생성할 때 사용
 */
export type SummarySections = {
  target?: string   // 지원 대상
  benefit?: string  // 지원 내용
  period?: string   // 지원 기간
  method?: string   // 신청 방법
  note?: string     // 기타 유의사항
}

/**
 * 텍스트 요약 함수 (규칙 기반)
 * 현재: 첫 2개 문장 추출
 * TODO: AI 요약으로 전환 고려
 */
export function summarize(description?: string | null): string | undefined {
  if (!description) return undefined

  // 공백 정규화 및 문장 분리
  const sents = description
    .replace(/\s+/g, ' ')
    .trim()
    .split(/[.!?]\s+/)
    .filter(s => s.length > 0)

  if (sents.length === 0) return undefined

  // 첫 2문장 추출, 3개 이상일 때만 마침표 추가 (truncation 표시)
  return sents.slice(0, 2).join('. ') + (sents.length > 2 ? '.' : '')
}
