import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '個別支援計画書作成支援システム',
  description: 'AI を活用した個別支援計画書の作成支援Webアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-card">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-foreground">
                個別支援計画書作成支援システム
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI を活用した高品質な個別支援計画書の生成
              </p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-border bg-card mt-16">
            <div className="container mx-auto px-4 py-6">
              <p className="text-center text-sm text-muted-foreground">
                © 2024 個別支援計画書作成支援システム
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}