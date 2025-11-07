// K-Startup API (창업넷) 클라이언트
import axios from 'axios'

const API_BASE_URL = process.env.K_STARTUP_API_URL
const API_KEY = process.env.K_STARTUP_API_KEY

/**
 * K-Startup API에서 지원사업 데이터 가져오기
 * @returns {Promise<{data: Array, error: boolean, message?: string}>} 지원사업 목록 및 에러 정보
 */
export async function fetchKStartupData() {
  const programs = []

  if (!API_BASE_URL || !API_KEY) {
    console.warn('⚠️  K-Startup API 설정이 없습니다. 환경변수를 확인하세요.')
    return { data: programs, error: false }
  }

  try {
    console.log('📡 K-Startup API 호출 중...')

    // K-Startup API: 지원사업 공고 정보 조회
    const response = await axios.get(`${API_BASE_URL}/getAnnouncementInformation01`, {
      params: {
        serviceKey: API_KEY,
        page: 1,
        perPage: 100,
        returnType: 'json', // 기본값이 xml이므로 json 명시
      },
      timeout: 30000,
    })

    // 응답 구조: { currentCount, matchCount, page, perPage, totalCount, data: [] }
    const items = response.data.data || []

    console.log(`✅ K-Startup: ${items.length}개 항목 수집`)

    for (const item of items) {
      // sourceId validation: 제목과 날짜가 반드시 있어야 함
      const title = item.biz_pbanc_nm
      const startDate = item.pbanc_rcpt_bgng_dt

      if (!title || !startDate) {
        console.warn(`⚠️  K-Startup: 필수 정보 없는 항목 스킵 (title: ${title || 'unknown'})`)
        continue
      }

      // 고유 ID 생성: 제목 일부 + 날짜
      const titleSlug = title.replace(/[^a-zA-Z0-9가-힣]/g, '').slice(0, 30)
      const id = `${titleSlug}-${startDate}`

      // 상태 판단: 종료일이 오늘보다 미래면 'open', 과거면 'closed'
      const endDate = item.pbanc_rcpt_end_dt
      let status = 'open'
      if (endDate) {
        const endDateTime = new Date(endDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
        status = endDateTime > new Date() ? 'open' : 'closed'
      }

      programs.push({
        source: 'k-startup',
        sourceId: `kstartup-${id}`,
        title: title,
        description: null, // API에서 제공하지 않음
        summary: null,
        category: item.supt_biz_clsfc || null,
        region: null, // API에서 제공하지 않음
        organizer: item.pbanc_ntrp_nm || null,
        target: item.aply_trgt || null,
        method: null,
        startDate: startDate ? new Date(startDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : null,
        endDate: endDate ? new Date(endDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : null,
        url: null, // API에서 제공하지 않음
        status: status,
        amountMin: null,
        amountMax: null,
      })
    }

  } catch (error) {
    console.error('❌ K-Startup API 오류:', error.message)
    if (error.response) {
      console.error('   응답 상태:', error.response.status)
      console.error('   응답 데이터:', error.response.data)
    }
    // 에러 발생 시 부분 데이터 반환 명시
    if (programs.length > 0) {
      console.warn(`⚠️  K-Startup: 에러 발생했지만 ${programs.length}개 항목은 수집됨 (부분 데이터)`)
    }
    return { data: programs, error: true, message: error.message }
  }

  return { data: programs, error: false }
}
