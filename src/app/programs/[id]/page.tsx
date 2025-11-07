import Link from 'next/link'
import { prisma } from '@/lib/prisma'

type Props = { params: { id: string } }

export default async function ProgramDetail({ params }: Props) {
  const program = await prisma.program.findUnique({ where: { id: params.id } })
  if (!program) return <div>존재하지 않는 항목입니다.</div>

  return (
    <div>
      <Link href="/">← 목록으로</Link>
      <h2 style={{ margin: '8px 0' }}>{program.title}</h2>
      <div style={{ color: '#666', fontSize: 14 }}>
        {program.organizer ? <span>주관: {program.organizer} · </span> : null}
        {program.region ? <span>지역: {program.region} · </span> : null}
        {program.category ? <span>분야: {program.category}</span> : null}
      </div>
      {program.summary && <p style={{ marginTop: 8 }}>{program.summary}</p>}
      {program.description && (
        <pre style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 12, borderRadius: 8 }}>
          {program.description}
        </pre>
      )}
      <table style={{ marginTop: 12 }}>
        <tbody>
          {program.startDate && (
            <tr><td>시작</td><td>{new Date(program.startDate).toLocaleString()}</td></tr>
          )}
          {program.endDate && (
            <tr><td>마감</td><td>{new Date(program.endDate).toLocaleString()}</td></tr>
          )}
          {program.url && (
            <tr><td>원문</td><td><a href={program.url} target="_blank">{program.url}</a></td></tr>
          )}
          {typeof program.amountMin === 'number' && (
            <tr><td>금액(최소)</td><td>{program.amountMin.toLocaleString()}만원</td></tr>
          )}
          {typeof program.amountMax === 'number' && (
            <tr><td>금액(최대)</td><td>{program.amountMax.toLocaleString()}만원</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

