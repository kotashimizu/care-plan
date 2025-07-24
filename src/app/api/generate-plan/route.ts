import { NextRequest, NextResponse } from 'next/server'
import { GeneratePlanRequest, GeneratePlanResponse } from '@/lib/types'
import { generateSystemPrompt, generateUserPrompt } from '@/lib/prompts'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    console.log('API: generate-plan called')
    
    let body: GeneratePlanRequest
    try {
      body = await request.json()
      console.log('API: Request body received:', JSON.stringify(body, null, 2))
    } catch (bodyParseError) {
      console.error('API: Request body parse error:', bodyParseError)
      return NextResponse.json(
        { error: 'リクエストボディの形式が正しくありません' },
        { status: 400 }
      )
    }
    
    const { interviewRecord, facilitySettings } = body

    if (!interviewRecord) {
      console.log('API: Missing interview record')
      return NextResponse.json(
        { error: '面談記録が必要です' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    const orgId = process.env.OPENAI_ORG_ID
    
    console.log('API: API Key exists:', !!apiKey)
    console.log('API: API Key length:', apiKey?.length || 0)
    console.log('API: API Key prefix:', apiKey?.substring(0, 7) || 'none')
    console.log('API: Org ID exists:', !!orgId)
    
    if (!apiKey) {
      console.log('API: Missing OpenAI API key')
      return NextResponse.json(
        { error: 'OpenAI API キーが設定されていません' },
        { status: 500 }
      )
    }

    console.log('API: Generating prompts...')
    const systemPrompt = generateSystemPrompt(facilitySettings)
    const userPrompt = generateUserPrompt(interviewRecord)
    console.log('API: System prompt length:', systemPrompt.length)
    console.log('API: User prompt length:', userPrompt.length)

    console.log('API: Calling OpenAI API...')
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
    
    if (orgId) {
      headers['OpenAI-Organization'] = orgId
      console.log('API: Using organization ID')
    }
    
    console.log('API: Request headers prepared')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    })
    
    console.log('API: OpenAI response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error - Status:', response.status)
      console.error('OpenAI API Error - Response:', errorText)
      console.error('OpenAI API Error - Headers:', Object.fromEntries(response.headers.entries()))
      
      return NextResponse.json(
        { 
          error: 'AI APIでエラーが発生しました',
          details: `Status: ${response.status}, Response: ${errorText.substring(0, 200)}`
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'AIからの応答が取得できませんでした' },
        { status: 500 }
      )
    }

    try {
      console.log('API: Parsing AI response...')
      console.log('API: AI response content (first 500 chars):', content.substring(0, 500))
      
      const plan = JSON.parse(content)
      console.log('API: Successfully parsed JSON')
      
      const result: GeneratePlanResponse = {
        plan: plan
      }

      return NextResponse.json(result)
    } catch (parseError) {
      console.error('JSON Parse Error - Full details:', {
        message: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        content: content,
        contentLength: content.length
      })
      return NextResponse.json(
        { 
          error: 'AIの応答形式が正しくありません',
          details: parseError instanceof Error ? parseError.message : 'Parse error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API Error - Full details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      error: error
    })
    
    return NextResponse.json(
      { 
        error: '内部サーバーエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}