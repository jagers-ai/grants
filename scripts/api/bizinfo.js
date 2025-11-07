// 기업마당 API (Bizinfo) 클라이언트
import axios from 'axios'

const API_BASE_URL = process.env.BIZINFO_API_URL
const API_KEY = process.env.BIZINFO_API_KEY

/**
 * 기업마당 API에서 지원사업 데이터 가져오기
 * @returns {Promise<{data: Array, error: boolean, message?: string}>} 지원사업 목록 및 에러 정보
 */
export async function fetchBizinfoData() {
  const programs = []

  if (!API_BASE_URL || !API_KEY) {
    console.warn('⚠️  기업마당 API 설정이 없습니다. 환경변수를 확인하세요.')
    return { data: programs, error: false }
  }

  try {
    console.log('📡 기업마당 API 호출 중...')

    // TODO: 실제 API 엔드포인트 및 파라미터 설정
    const response = await axios.get(API_BASE_URL, {
      params: {
        serviceKey: API_KEY,
        pageNo: 1,
        numOfRows: 100,
        // 기타 필수 파라미터 추가
      },
      timeout: 30000,
    })

    // TODO: 응답 형식에 따라 파싱 (XML/JSON)
    const items = response.data.items || response.data.response?.body?.items || []

    console.log(`✅ 기업마당: ${items.length}개 항목 수집`)

    for (const item of items) {
      // sourceId validation: id 또는 policyId가 반드시 있어야 함
      const id = item.id || item.policyId
      if (!id) {
        console.warn(`⚠️  기업마당: ID 없는 항목 스킵 (title: ${item.title || item.policyNm || 'unknown'})`)
        continue
      }

      programs.push({
        source: 'bizinfo',
        sourceId: `bizinfo-${id}`,
        title: item.title || item.policyNm,
        description: item.description || item.policyCn,
        summary: item.summary,
        category: item.category || item.policyFld,
        region: item.region || item.policyRgn,
        organizer: item.organizer || item.inqrCtgryNm,
        target: item.target || item.sprtTrgtNm,
        method: item.method,
        startDate: item.startDate ? new Date(item.startDate) : null,
        endDate: item.endDate ? new Date(item.endDate) : null,
        url: item.url || item.policyUrl,
        status: item.status || 'open',
        amountMin: item.amountMin ? parseInt(item.amountMin, 10) : null,
        amountMax: item.amountMax ? parseInt(item.amountMax, 10) : null,
      })
    }

  } catch (error) {
    console.error('❌ 기업마당 API 오류:', error.message)
    if (error.response) {
      console.error('   응답 상태:', error.response.status)
      console.error('   응답 데이터:', error.response.data)
    }
    // 에러 발생 시 부분 데이터 반환 명시
    if (programs.length > 0) {
      console.warn(`⚠️  기업마당: 에러 발생했지만 ${programs.length}개 항목은 수집됨 (부분 데이터)`)
    }
    return { data: programs, error: true, message: error.message }
  }

  return { data: programs, error: false }
}
