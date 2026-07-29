import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { AppProvider } from '@/components/app-provider'
import './globals.css'

export const metadata: Metadata = {
  title: '택시타쉐어 · 같은 방향이라면 택시비도 함께',
  description:
    '같은 방향으로 이동하는 대학생이 함께 택시를 타고 비용을 나누는 동승 매칭 서비스, 택시타쉐어.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FFC72C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="bg-muted">
      <body className="font-sans antialiased">
        <AppProvider>{children}</AppProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
