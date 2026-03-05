/**
 * Vertex AI Express Mode (Gemini API) クライアント
 * - REST APIベースでfetchのみ使用（追加依存なし）
 * - 環境変数 GEMINI_API_KEY で認証
 * - デフォルトモデル: gemini-2.5-flash
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

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

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY が設定されていません。.env.local ファイルを確認してください。')
  }
  return key
}

function getModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash'
}

export async function generateContent(request: GeminiRequest): Promise<GeminiResponse> {
  const apiKey = getApiKey()
  const model = getModel()
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`

  const body: Record<string, unknown> = {
    contents: request.messages.map(msg => ({
      role: msg.role,
      parts: msg.parts,
    })),
    generationConfig: {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxOutputTokens ?? 3000,
      ...(request.jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  }

  if (request.systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: request.systemInstruction }],
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 45000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
