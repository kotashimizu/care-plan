import { NextRequest, NextResponse } from 'next/server'
import { GeneratePlanRequest } from '@/lib/types'
import { generateJsonContent } from '@/lib/ai-client'
import { generateSystemPrompt, generateUserPrompt } from '@/lib/prompts'

const MAX_INPUT_LENGTH = 10000

export async function POST(request: NextRequest) {
  try {
    let body: GeneratePlanRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'リクエストボディの形式が正しくありません' },
        { status: 400 }
      )
    }

    const { interviewRecord, facilitySettings } = body

    if (!interviewRecord) {
      return NextResponse.json(
        { error: '面談記録が必要です' },
        { status: 400 }
      )
    }

    if (interviewRecord.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `面談記録は${MAX_INPUT_LENGTH}文字以内で入力してください` },
        { status: 400 }
      )
    }

    const systemPrompt = generateSystemPrompt(facilitySettings)
    const userPrompt = generateUserPrompt(interviewRecord)

    const plan = await generateJsonContent({
      systemInstruction: systemPrompt,
      messages: [{ role: 'user', parts: [{ text: userPrompt }] }],
      temperature: 0.7,
      maxOutputTokens: 8000,
    })

    return NextResponse.json({ plan })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'リクエストがタイムアウトしました。しばらく待ってから再試行してください。' },
        { status: 504 }
      )
    }

    const message = error instanceof Error ? error.message : '内部サーバーエラーが発生しました'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
