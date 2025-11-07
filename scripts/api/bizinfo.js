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

    // 기업마당 API: 지원사업 정보 조회 (주의: crtfcKey 사용!)
    const response = await axios.get(API_BASE_URL, {
      params: {
        crtfcKey: API_KEY,  // serviceKey가 아닌 crtfcKey 사용!
        dataType: 'json',   // JSON 형식 요청
        pageIndex: 1,
        pageUnit: 100,
      },
      timeout: 30000,
    })

    // 응답 구조: { list: [], totCnt: number } 또는 { bizinfo: { list: [] } }
    const items = response.data.list || response.data.bizinfo?.list || []

    console.log(`✅ 기업마당: ${items.length}개 항목 수집`)

    for (const item of items) {
      // sourceId validation: pblancId가 반드시 있어야 함
      const id = item.pblancId
      if (!id) {
        console.warn(`⚠️  기업마당: ID 없는 항목 스킵 (title: ${item.title || 'unknown'})`)
        continue
      }

      // pubDate 파싱 (다양한 형식 대응: "Wed, 08 Jan 2025 12:00:00 +0900" 등)
      let pubDate = null
      if (item.pubDate) {
        try {
          pubDate = new Date(item.pubDate)
        } catch (e) {
          console.warn(`⚠️  날짜 파싱 실패: ${item.pubDate}`)
        }
      }

      programs.push({
        source: 'bizinfo',
        sourceId: `bizinfo-${id}`,
        title: item.title,
        description: item.description || null,
        summary: null,
        category: item.hashtags || null,
        region: null, // API에서 제공하지 않음
        organizer: item.author || null,
        target: null, // API에서 제공하지 않음
        method: null,
        startDate: pubDate, // 등록일을 시작일로 사용
        endDate: null, // API에서 제공하지 않음
        url: item.link || null,
        status: 'open', // 기본값 (종료일 정보 없음)
        amountMin: null,
        amountMax: null,
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
