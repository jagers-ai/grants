import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { summarize } from '@/lib/summary'

export default async function HomePage() {
  const programs = await prisma.program.findMany({
    orderBy: [{ endDate: 'asc' }, { createdAt: 'desc' }],
    take: 50,
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>목록</Link>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {programs.map((p) => (
          <li key={p.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <h3 style={{ margin: '4px 0' }}>
              <Link href={`/programs/${p.id}`} style={{ textDecoration: 'none' }}>{p.title}</Link>
            </h3>
            <div style={{ color: '#666', fontSize: 14 }}>
              {p.organizer ? <span>주관: {p.organizer} · </span> : null}
              {p.region ? <span>지역: {p.region} · </span> : null}
              {p.category ? <span>분야: {p.category}</span> : null}
            </div>
            <p style={{ marginTop: 8 }}>{p.summary ?? summarize(p.description) ?? '요약 없음'}</p>
            <div style={{ fontSize: 13, color: '#888' }}>
              {p.startDate ? <span>시작: {new Date(p.startDate).toLocaleDateString()} · </span> : null}
              {p.endDate ? <span>마감: {new Date(p.endDate).toLocaleDateString()}</span> : null}
            </div>
          </li>
        ))}
      </ul>
      {programs.length === 0 && (
        <div style={{ color: '#666' }}>
          아직 데이터가 없습니다. `npm run seed` 또는 `npm run ingest`로 더미 데이터를 추가하세요.
        </div>
      )}
    </div>
  )
}

