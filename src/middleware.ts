import { NextRequest, NextResponse } from 'next/server'

/**
 * API認証ミドルウェア
 * /api/* へのリクエストに対してBearerトークン認証を実施
 * 環境変数 API_ACCESS_PASSWORD と照合
 */
export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const password = process.env.API_ACCESS_PASSWORD
  if (!password) {
    // パスワード未設定の場合はスキップ（開発環境用）
    return NextResponse.next()
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: '認証が必要です' },
      { status: 401 }
    )
  }

  const token = authHeader.slice(7)
  if (token !== password) {
    return NextResponse.json(
      { error: '認証に失敗しました' },
      { status: 403 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
