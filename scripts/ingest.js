// Placeholder ingest script for option B (local only)
// Later, implement calls to data.go.kr or other sources.
// import axios from 'axios'  // TODO: 공공 API 연동 시 활성화
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function ingest() {
  console.log('[ingest] start')
  // Example placeholder: fetch nothing, just log. Implement real source later.
  // If you want to test, push a mock item:
  const now = new Date()
  await prisma.program.create({
    data: {
      title: `로컬 인제스트 테스트 (${now.toISOString()})`,
      source: 'local',
      sourceId: `local-${now.getTime()}`,
      summary: '인제스트 스크립트 점검용 더미 데이터',
      description: '공공 API 연동 전, 로컬에서 동작 확인을 위한 더미 항목입니다.',
      category: '테스트',
      region: '전국',
      target: '개발자',
      method: 'N/A',
      amountMin: 0,
      amountMax: 0,
      status: 'open',
      url: 'https://example.com',
      organizer: '로컬'
    }
  })
  console.log('[ingest] done')
}

ingest().finally(async () => {
  await prisma.$disconnect()
})

