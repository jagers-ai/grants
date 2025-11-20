import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { summarize } from '@/lib/summary'
import { Prisma } from '@prisma/client'

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function HomePage({ searchParams }: PageProps) {
  // URL 쿼리 파라미터 가져오기
  const params = searchParams ?? {}
  const statusParam = params.status as string | undefined
  const categoryParam = params.category as string | string[] | undefined
  const sourceParam = params.source as string | string[] | undefined

  // Prisma where 조건 구성
  const where: Prisma.ProgramWhereInput = {}

  // Status 필터 (기본값: open)
  if (statusParam && statusParam !== 'all') {
    where.status = statusParam
  } else if (!statusParam) {
    // 파라미터 없으면 기본적으로 진행중만 표시
    where.status = 'open'
  }

  // Category 필터 (다중 선택)
  if (categoryParam) {
    const categories = Array.isArray(categoryParam)
      ? categoryParam
      : categoryParam.split(',')
    where.category = { in: categories }
  }

  // Source 필터 (다중 선택)
  if (sourceParam) {
    const sources = Array.isArray(sourceParam)
      ? sourceParam
      : sourceParam.split(',')
    where.source = { in: sources }
  }

  const programs = await prisma.program.findMany({
    where,
    orderBy: [
      // 조회수 내림차순, 없는 값(null)은 최하단으로 보장
      { viewCount: { sort: 'desc', nulls: 'last' } as any },
      { endDate: 'asc' },
      { createdAt: 'desc' },
    ],
    take: 50,
  })

  // 필터 통계 (UI 표시용)
  const totalCount = await prisma.program.count({ where })

  // 카테고리 통계 (필터 UI용)
  const categoryStats = await prisma.program.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } },
  })

  return (
    <div>
      {/* 필터 섹션 */}
      <div style={{
        border: '1px solid #ddd',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#f9f9f9'
      }}>
        <h3 style={{ margin: '0 0 12px 0' }}>필터 ({totalCount}개)</h3>

        {/* Status 필터 */}
        <div style={{ marginBottom: 12 }}>
          <strong>상태:</strong>{' '}
          <Link
            href="/?status=open"
            style={{
              textDecoration: 'none',
              padding: '4px 8px',
              backgroundColor: !statusParam || statusParam === 'open' ? '#007bff' : '#eee',
              color: !statusParam || statusParam === 'open' ? 'white' : 'black',
              borderRadius: 4,
              marginLeft: 8
            }}
          >
            진행중
          </Link>
          <Link
            href="/?status=closed"
            style={{
              textDecoration: 'none',
              padding: '4px 8px',
              backgroundColor: statusParam === 'closed' ? '#007bff' : '#eee',
              color: statusParam === 'closed' ? 'white' : 'black',
              borderRadius: 4,
              marginLeft: 8
            }}
          >
            마감
          </Link>
          <Link
            href="/?status=all"
            style={{
              textDecoration: 'none',
              padding: '4px 8px',
              backgroundColor: statusParam === 'all' ? '#007bff' : '#eee',
              color: statusParam === 'all' ? 'white' : 'black',
              borderRadius: 4,
              marginLeft: 8
            }}
          >
            전체
          </Link>
        </div>

        {/* Category 필터 */}
        <div style={{ marginBottom: 12 }}>
          <strong>분야:</strong>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categoryStats.slice(0, 10).map(({ category, _count }) => {
              const selectedCategories = categoryParam
                ? (Array.isArray(categoryParam) ? categoryParam : categoryParam.split(','))
                : []
              const isSelected = selectedCategories.includes(category || '')

              return category ? (
                <Link
                  key={category}
                  href={
                    isSelected
                      ? `/?category=${selectedCategories.filter(c => c !== category).join(',')}`
                      : `/?category=${[...selectedCategories, category].join(',')}`
                  }
                  style={{
                    textDecoration: 'none',
                    padding: '4px 8px',
                    backgroundColor: isSelected ? '#28a745' : '#eee',
                    color: isSelected ? 'white' : 'black',
                    borderRadius: 4,
                    fontSize: 13
                  }}
                >
                  {category} ({_count})
                </Link>
              ) : null
            })}
          </div>
        </div>

        {/* Source 필터 */}
        <div>
          <strong>출처:</strong>{' '}
          {['k-startup', 'bizinfo'].map(source => {
            const selectedSources = sourceParam
              ? (Array.isArray(sourceParam) ? sourceParam : sourceParam.split(','))
              : []
            const isSelected = selectedSources.includes(source)

            return (
              <Link
                key={source}
                href={
                  isSelected
                    ? `/?source=${selectedSources.filter(s => s !== source).join(',')}`
                    : `/?source=${[...selectedSources, source].join(',')}`
                }
                style={{
                  textDecoration: 'none',
                  padding: '4px 8px',
                  backgroundColor: isSelected ? '#28a745' : '#eee',
                  color: isSelected ? 'white' : 'black',
                  borderRadius: 4,
                  marginLeft: 8
                }}
              >
                {source === 'k-startup' ? 'K-Startup' : '기업마당'}
              </Link>
            )
          })}
        </div>

        {/* 필터 초기화 */}
        {(statusParam || categoryParam || sourceParam) && (
          <div style={{ marginTop: 12 }}>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                padding: '4px 8px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: 4
              }}
            >
              필터 초기화
            </Link>
          </div>
        )}
      </div>

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
            {p.source === 'bizinfo' ? (
              <div style={{ color: '#d00', fontSize: 13, marginTop: 4 }}>
                조회수 {typeof p.viewCount === 'number' ? p.viewCount : 'null'}
              </div>
            ) : null}
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
