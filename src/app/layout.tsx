import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Grants (Option B) — Local',
  description: '정부지원사업 요약/정리를 위한 로컬 POC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, Helvetica, Arial, sans-serif'
      }}>
        <div style={{ maxWidth: 960, margin: '24px auto', padding: '0 16px' }}>
          <header style={{ marginBottom: 16 }}>
            <h1 style={{ margin: '8px 0' }}>Grants (Local, SQLite)</h1>
            <p style={{ color: '#666', margin: 0 }}>Option B: Next.js + Prisma(SQLite)</p>
          </header>
          <main>{children}</main>
          <footer style={{ marginTop: 40, color: '#888' }}>
            <small>© {new Date().getFullYear()} Grants</small>
          </footer>
        </div>
      </body>
    </html>
  )
}

