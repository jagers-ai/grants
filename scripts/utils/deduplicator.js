/**
 * 여러 소스에서 수집한 데이터의 중복 제거
 *
 * 중복 판단 기준:
 * 1. sourceId가 같은 경우 (완전 중복)
 * 2. 제목 + 주관기관이 유사한 경우 (다른 소스에서 같은 사업)
 */

/**
 * 프로그램 목록에서 중복 제거
 * @param {Array} programs - 지원사업 목록
 * @returns {Array} 중복 제거된 목록
 */
export function deduplicatePrograms(programs) {
  const seen = new Map()
  const unique = []

  for (const program of programs) {
    // sourceId가 없는 프로그램 스킵 (이미 API 클라이언트에서 필터링되어야 하지만 방어적 처리)
    if (!program.sourceId) {
      console.warn(`⚠️  sourceId 없는 항목 스킵: ${program.title || 'unknown'} (${program.source})`)
      continue
    }

    // sourceId가 이미 존재하면 스킵
    if (seen.has(program.sourceId)) {
      continue
    }

    // 제목 + 주관기관 + 시작일로 중복 체크
    // (같은 사업이 매년 반복되는 경우를 구분하기 위해 날짜 포함)
    const normalizedTitle = normalizeString(program.title)
    const normalizedOrganizer = normalizeString(program.organizer)
    const dateKey = program.startDate
      ? new Date(program.startDate).toISOString().substring(0, 10)  // YYYY-MM-DD
      : 'no-date'
    const key = `${normalizedTitle}|${normalizedOrganizer}|${dateKey}`

    if (!seen.has(key)) {
      seen.set(program.sourceId, true)
      seen.set(key, true)
      unique.push(program)
    } else {
      // 중복 발견 시에도 sourceId를 seen에 추가 (같은 sourceId의 다른 프로그램 방지)
      seen.set(program.sourceId, true)
      console.log(`⚠️  중복 발견: ${program.title} (${program.source})`)
    }
  }

  console.log(`📊 중복 제거: ${programs.length}개 → ${unique.length}개`)
  return unique
}

/**
 * 문자열 정규화 (비교용)
 * @param {string} str - 정규화할 문자열
 * @returns {string} 정규화된 문자열
 */
function normalizeString(str) {
  if (!str) return ''

  return str
    .toLowerCase()
    .replace(/\s+/g, '')       // 공백 제거
    .replace(/[()[\]{}]/g, '') // 괄호 제거
    .replace(/[-.·]/g, '')     // 특수문자 제거
}
