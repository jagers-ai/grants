// Simple seed to insert a sample program
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.program.findFirst({ where: { sourceId: 'seed-001' } })
  if (!existing) {
    await prisma.program.create({
      data: {
        title: '샘플 지원사업 - 창업 패키지',
        source: 'seed',
        sourceId: 'seed-001',
        summary: '초기 창업기업 대상 멘토링/사업화 자금 지원',
        description: '초기 창업 기업을 위한 멘토링과 시제품 제작, 마케팅 지원을 제공합니다.',
        category: '창업',
        region: '전국',
        target: '예비/초기 창업 기업',
        method: '온라인 신청',
        amountMin: 1000,
        amountMax: 5000,
        status: 'open',
        url: 'https://www.example.com/program/seed-001',
        organizer: '중소벤처기업부'
      }
    })
  }
}

main().finally(async () => {
  await prisma.$disconnect()
})

