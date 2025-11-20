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

    // 응답 구조: { jsonArray: [...] }
    const items = response.data.jsonArray || response.data.list || response.data.bizinfo?.list || []

    console.log(`✅ 기업마당: ${items.length}개 항목 수집`)

    for (const item of items) {
      // sourceId validation: pblancId가 반드시 있어야 함
      const id = item.pblancId
      const title = item.pblancNm

      if (!id || !title) {
        console.warn(`⚠️  기업마당: ID/제목 없는 항목 스킵 (id: ${id}, title: ${title})`)
        continue
      }

      // reqstBeginEndDe 파싱 (예: "20251112 ~ 20251127" 또는 "예산 소진시까지")
      let startDate = null
      let endDate = null
      let status = 'open'
      const viewCount = (() => {
        const raw = item.inqireCo ?? item.inqCnt ?? null
        if (raw === null || raw === undefined) return null
        const num = Number(raw)
        return Number.isFinite(num) ? num : null
      })()

      if (item.reqstBeginEndDe && item.reqstBeginEndDe.includes('~')) {
        const dates = item.reqstBeginEndDe.split('~').map(d => d.trim())

        // YYYYMMDD 형식을 YYYY-MM-DD로 변환하는 헬퍼 함수
        const parseDate = (dateStr) => {
          const cleaned = dateStr.replace(/\s/g, '') // 공백 제거
          if (/^\d{8}$/.test(cleaned)) {
            // YYYYMMDD 형식
            const year = cleaned.substring(0, 4)
            const month = cleaned.substring(4, 6)
            const day = cleaned.substring(6, 8)
            return new Date(`${year}-${month}-${day}`)
          }
          return null
        }

        if (dates[0]) {
          startDate = parseDate(dates[0])
        }
        if (dates[1]) {
          endDate = parseDate(dates[1])
          if (endDate) {
            status = endDate > new Date() ? 'open' : 'closed'
          }
        }
      }

      // URL 생성 (상대 경로를 절대 경로로)
      const url = item.pblancUrl
        ? `https://www.bizinfo.go.kr${item.pblancUrl}`
        : item.rceptEngnHmpgUrl || null

      programs.push({
        source: 'bizinfo',
        sourceId: `bizinfo-${id}`,
        title: title,
        description: item.bsnsSumryCn || null,
        summary: null,
        category: item.pldirSportRealmLclasCodeNm || item.hashtags || null,
        region: null, // API에서 제공하지 않음
        organizer: item.jrsdInsttNm || item.excInsttNm || null,
        target: item.trgetNm || null,
        method: null,
        startDate: startDate,
        endDate: endDate,
        url: url,
        status: status,
        amountMin: null,
        amountMax: null,
        viewCount: viewCount,
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
