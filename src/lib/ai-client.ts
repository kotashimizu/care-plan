/**
 * Vertex AI クライアント（サービスアカウント認証）
 * - Google Cloud Vertex AI API を使用
 * - サービスアカウントキー（Base64）で OAuth2 トークン取得
 * - データ保護: ISMAP認証、DPA、東京リージョン
 * - デフォルトモデル: gemini-2.5-flash
 */

import { GoogleAuth } from 'google-auth-library'

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export interface GeminiRequest {
  systemInstruction?: string
  messages: GeminiMessage[]
  temperature?: number
  maxOutputTokens?: number
  jsonMode?: boolean
}

export interface GeminiResponse {
  text: string
}

let authClient: GoogleAuth | null = null

function getAuth(): GoogleAuth {
  if (authClient) return authClient

  const base64Key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!base64Key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY が設定されていません。.env.local ファイルを確認してください。')
  }

  const keyJson = JSON.parse(Buffer.from(base64Key, 'base64').toString('utf-8'))

  authClient = new GoogleAuth({
    credentials: keyJson,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })

  return authClient
}

function getProject(): string {
  return process.env.GOOGLE_CLOUD_PROJECT || 'plan-462316'
}

function getLocation(): string {
  return process.env.GOOGLE_CLOUD_LOCATION || 'asia-northeast1'
}

function getModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash'
}

export async function generateContent(request: GeminiRequest): Promise<GeminiResponse> {
  const auth = getAuth()
  const client = await auth.getClient()
  const tokenResponse = await client.getAccessToken()
  const accessToken = tokenResponse.token

  if (!accessToken) {
    throw new Error('アクセストークンの取得に失敗しました')
  }

  const project = getProject()
  const location = getLocation()
  const model = getModel()
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`

  const body: Record<string, unknown> = {
    contents: request.messages.map(msg => ({
      role: msg.role,
      parts: msg.parts,
    })),
    generationConfig: {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxOutputTokens ?? 8000,
      ...(request.jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  }

  if (request.systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: request.systemInstruction }],
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 90000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = 'AI APIでエラーが発生しました'
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          errorMessage = `AI API Error: ${errorData.error.message}`
        }
      } catch {
        // JSONパース失敗は無視
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error('AIからの応答が取得できませんでした')
    }

    return { text }
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * JSON形式のレスポンスを取得してパースするヘルパー
 */
export async function generateJsonContent<T = unknown>(request: GeminiRequest): Promise<T> {
  const response = await generateContent({
    ...request,
    jsonMode: true,
  })

  let cleanContent = response.text.trim()
  const jsonStart = cleanContent.indexOf('{')
  const jsonEnd = cleanContent.lastIndexOf('}')

  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1)
  }

  try {
    return JSON.parse(cleanContent) as T
  } catch {
    throw new Error('AIの応答形式が正しくありません')
  }
}
