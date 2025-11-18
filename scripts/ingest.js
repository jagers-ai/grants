// 공공 API 데이터 수집 스크립트
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { fetchKStartupData } from './api/k-startup.js'
import { fetchBizinfoData } from './api/bizinfo.js'
import { deduplicatePrograms } from './utils/deduplicator.js'

const prisma = new PrismaClient()

// 최소 형태 검증용 스키마 (ingest 안전장치)
const ProgramInputSchema = z.object({
  source: z.string().nullable().optional(),
  sourceId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  target: z.string().nullable().optional(),
  method: z.string().nullable().optional(),
  amountMin: z.number().int().nullable().optional(),
  amountMax: z.number().int().nullable().optional(),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  status: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  organizer: z.string().nullable().optional()
})

async function ingest() {
  console.log('🚀 [ingest] 데이터 수집 시작...\n')

  try {
    // 1. 두 API에서 데이터 수집
    const kStartupResult = await fetchKStartupData()
    const bizinfoResult = await fetchBizinfoData()

    // 에러 발생 시 경고 출력
    if (kStartupResult.error) {
      console.warn(`⚠️  K-Startup API 에러: ${kStartupResult.message}`)
    }
    if (bizinfoResult.error) {
      console.warn(`⚠️  Bizinfo API 에러: ${bizinfoResult.message}`)
    }

    // 2. 데이터 병합
    const allData = [...kStartupResult.data, ...bizinfoResult.data]
    console.log(`\n📦 총 수집: ${allData.length}개 항목`)

    if (allData.length === 0) {
      console.log('⚠️  수집된 데이터가 없습니다.')
      console.log('   환경변수(API 키)를 확인하세요.')
      return
    }

    // 3. 중복 제거
    const uniquePrograms = deduplicatePrograms(allData)
    console.log(`\n🧹 중복 제거 후: ${uniquePrograms.length}개`)

    // 3-1. 최소 스키마 검증
    const validPrograms = []
    let skippedForValidation = 0

    for (const program of uniquePrograms) {
      const result = ProgramInputSchema.safeParse(program)
      if (!result.success) {
        skippedForValidation++
        console.warn('⚠️  유효하지 않은 프로그램 항목 스킵:', {
          title: program.title,
          sourceId: program.sourceId,
          issues: result.error.issues.map((i) => i.message)
        })
        continue
      }
      validPrograms.push(result.data)
    }

    console.log(`\n💾 DB 저장 시작... (유효 항목: ${validPrograms.length}개, 검증 실패: ${skippedForValidation}개)`)

    // 4. DB에 저장 (upsert로 중복 방지)
    let created = 0
    let updated = 0
    let errors = 0

    for (const program of validPrograms) {
      try {
        const existing = await prisma.program.findUnique({
          where: { sourceId: program.sourceId }
        })

        await prisma.program.upsert({
          where: { sourceId: program.sourceId },
          update: program,
          create: program
        })

        if (existing) {
          updated++
        } else {
          created++
        }
      } catch (error) {
        errors++
        console.error(`❌ 저장 실패: ${program.title}`)
        console.error(`   sourceId: ${program.sourceId}`)
        console.error(`   오류: ${error.message}`)
        if (error.code) {
          console.error(`   에러 코드: ${error.code}`)
        }
      }
    }

    // 5. 결과 출력
    console.log(`\n✅ [ingest] 완료!`)
    console.log(`   - 신규 생성: ${created}개`)
    console.log(`   - 업데이트: ${updated}개`)
    if (errors > 0) {
      console.log(`   - 오류: ${errors}개`)
    }

    // 6. 통계
    const totalCount = await prisma.program.count()
    const bySource = await prisma.program.groupBy({
      by: ['source'],
      _count: true
    })
    const byStatus = await prisma.program.groupBy({
      by: ['status'],
      _count: true
    })

    console.log(`\n📊 전체 통계:`)
    console.log(`   - 총 사업 수: ${totalCount}개`)
    bySource.forEach(item => {
      console.log(`   - 출처 ${item.source ?? 'unknown'}: ${item._count}개`)
    })
    byStatus.forEach(item => {
      console.log(`   - 상태 ${item.status ?? 'unknown'}: ${item._count}개`)
    })

  } catch (error) {
    console.error('❌ [ingest] 오류:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Unhandled promise rejection 처리
ingest().catch((error) => {
  console.error('❌ Unhandled error in ingest:', error)
  process.exit(1)
})
