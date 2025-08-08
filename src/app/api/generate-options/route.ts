import { NextRequest, NextResponse } from 'next/server'
import { ServiceType, PlanDetailLevel } from '@/lib/types'

interface GenerateOptionsRequest {
  interviewRecord: string;
  serviceType: ServiceType;
  planDetailLevel: PlanDetailLevel;
}

export async function POST(request: NextRequest) {
  try {
    console.log('API: generate-options called')
    
    let body: GenerateOptionsRequest
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
    
    const { interviewRecord, serviceType, planDetailLevel } = body

    if (!interviewRecord || !serviceType || !planDetailLevel) {
      console.log('API: Missing required fields')
      return NextResponse.json(
        { error: '必要な項目が不足しています' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      console.error('API: Missing OpenAI API key')
      console.error('Environment variables:', Object.keys(process.env).filter(key => key.includes('OPENAI')))
      return NextResponse.json(
        { error: 'OpenAI API キーが設定されていません。.env.localファイルを確認してください。' },
        { status: 500 }
      )
    }
    
    console.log('API: API key found, length:', apiKey.length)

    const systemPrompt = generateOptionsSystemPrompt(serviceType, planDetailLevel)
    const userPrompt = generateOptionsUserPrompt(interviewRecord)

    console.log('API: System prompt length:', systemPrompt.length)
    console.log('API: User prompt length:', userPrompt.length)
    console.log('API: Calling OpenAI API for options generation...')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45000)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      }),
    })
    
    clearTimeout(timeoutId)
    
    console.log('API: OpenAI response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      
      // OpenAI APIの具体的なエラーメッセージを含める
      let errorMessage = 'AI APIでエラーが発生しました'
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          errorMessage = `AI API Error: ${errorData.error.message}`
        }
      } catch {
        // JSONパースエラーは無視
      }
      
      return NextResponse.json(
        { error: errorMessage },
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
      
      let cleanContent = content.trim()
      const jsonStartIndex = cleanContent.indexOf('{')
      const jsonEndIndex = cleanContent.lastIndexOf('}')
      
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        cleanContent = cleanContent.substring(jsonStartIndex, jsonEndIndex + 1)
      }
      
      const options = JSON.parse(cleanContent)
      console.log('API: Successfully parsed options JSON')
      console.log('API: Full parsed options:', JSON.stringify(options, null, 2))
      console.log('API: Parsed data structure:', {
        hasUserIntentions: !!options.userAndFamilyIntentions,
        userIntentionsValue: options.userAndFamilyIntentions,
        hasComprehensive: !!options.comprehensiveSupport,
        comprehensiveValue: options.comprehensiveSupport,
        optionsCount: options.supportPlanOptions?.length || 0
      })
      
      // 意向と支援方針も含めて返す
      const responseData = { 
        options: options.supportPlanOptions || [],
        userAndFamilyIntentions: options.userAndFamilyIntentions || null,
        comprehensiveSupport: options.comprehensiveSupport || null
      }
      console.log('API: Sending response:', JSON.stringify(responseData, null, 2))
      return NextResponse.json(responseData)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      return NextResponse.json(
        { error: 'AIの応答形式が正しくありません' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API Error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    })
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'リクエストがタイムアウトしました' },
        { status: 504 }
      )
    }
    
    const errorMessage = error instanceof Error 
      ? `内部サーバーエラー: ${error.message}` 
      : '内部サーバーエラーが発生しました'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

function generateOptionsSystemPrompt(serviceType: ServiceType, planDetailLevel: PlanDetailLevel) {
  const serviceTypeNames = {
    'employment-a': '就労継続支援A型',
    'employment-b': '就労継続支援B型',
    'daily-care': '生活介護'
  }

  const detailLevelDescription = planDetailLevel === 'detailed' 
    ? '具体的で詳細な支援内容（記録、評価、具体的手順を含む）'
    : '基本的で実行しやすい支援内容（緩やかなアプローチ）'

  return `あなたは${serviceTypeNames[serviceType]}の経験豊富なサービス管理責任者です。
厚生労働省の個別支援計画書作成指針に基づき、利用者の強みと課題を分析し、実効性の高い支援計画を策定してください。

## 重要な指示事項：
1. **専門性**: 福祉専門職として適切な専門用語を使用し、具体的で実行可能な支援内容を記載
2. **個別性**: 面談記録から読み取れる利用者固有の状況・特性・希望を必ず反映
3. **実効性**: 「〜を支援する」などの曖昧な表現を避け、具体的な行動レベルで記載
4. **簡潔性**: 冗長な前置きや繰り返しを避け、要点を明確に記載

## 出力形式（厳守）
出力は必ずJSON形式で返してください。下記スキーマに厳密に従い、余計な文章は一切付けないでください。
{
  "userAndFamilyIntentions": "利用者とご家族の意向を50-100文字で自然な文章として記載。テンプレート的な表現を避け、面談記録の内容を踏まえた個別性のある文章",
  "comprehensiveSupport": "総合的な支援の方針を100-150文字で記載。事業種別の特性と利用者の個別ニーズを踏まえた具体的な支援方針",
  "supportPlanOptions": [
    {
      "id": "A1",
      "category": "A",
      "title": "簡潔な支援項目名（10文字以内）",
      "content": "具体的な支援内容。何を、どのように、どの程度の頻度で実施するか明記（100文字以内）"
    }
  ]
}

## 3つの支援領域：
### A項目：就労・作業支援
- 作業スキル向上、職場適応、就労準備性の向上
- 具体例：作業手順の習得、集中力向上訓練、職場マナー指導

### B項目：生活支援  
- ADL/IADL向上、健康管理、生活リズム確立
- 具体例：服薬管理、金銭管理、身だしなみ指導

### C項目：社会生活支援
- 対人スキル向上、社会資源活用、余暇活動
- 具体例：SST実施、地域行事参加、ピアサポート

${planDetailLevel === 'detailed' ? 
`## 詳細プランの要件：
- 週間/月間スケジュールを想定した頻度設定
- 評価指標の明確化（数値目標含む）
- 段階的なステップアップの設定` :
`## 基本プランの要件：
- スモールステップでの目標設定
- 利用者の負担に配慮した段階的アプローチ
- 成功体験を重視した支援内容`}

各領域3項目ずつ、重複のない多角的な支援内容を提案してください。`
}

function generateOptionsUserPrompt(interviewRecord: string) {
  return `以下の面談記録を詳細に分析し、利用者の強み・課題・希望を特定した上で、個別性の高い支援計画を策定してください。

## 面談記録：
${interviewRecord}

## 分析の視点：
1. 利用者が明示的に述べている希望・要望
2. 現在の生活状況から推測される支援ニーズ
3. 利用者の強み・できていること
4. 優先的に取り組むべき課題

上記を踏まえ、画一的でない、この利用者固有の支援計画を9項目提案してください。`
}