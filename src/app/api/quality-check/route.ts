import { NextRequest, NextResponse } from 'next/server'
import { IndividualSupportPlan, QualityCheckResult } from '@/lib/types'
import { generateQualityCheckPrompt } from '@/lib/prompts'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { plan }: { plan: IndividualSupportPlan } = await request.json()

    if (!plan) {
      return NextResponse.json(
        { error: '個別支援計画書が必要です' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API キーが設定されていません' },
        { status: 500 }
      )
    }

    const planText = `
ご本人・ご家族の意向: ${plan.userAndFamilyIntentions}
総合的な支援の方針: ${plan.comprehensiveSupport}
長期目標: ${plan.longTermGoal}
短期目標: ${plan.shortTermGoal}

就労支援目標:
- 目標: ${plan.supportGoals.employment.objective}
- ご本人の役割: ${plan.supportGoals.employment.userRole}
- 支援内容: ${plan.supportGoals.employment.supportContent}
- 頻度: ${plan.supportGoals.employment.frequency}
- 評価: ${plan.supportGoals.employment.evaluation}

日常生活支援目標:
- 目標: ${plan.supportGoals.dailyLife.objective}
- ご本人の役割: ${plan.supportGoals.dailyLife.userRole}
- 支援内容: ${plan.supportGoals.dailyLife.supportContent}
- 頻度: ${plan.supportGoals.dailyLife.frequency}
- 評価: ${plan.supportGoals.dailyLife.evaluation}

社会生活支援目標:
- 目標: ${plan.supportGoals.socialLife.objective}
- ご本人の役割: ${plan.supportGoals.socialLife.userRole}
- 支援内容: ${plan.supportGoals.socialLife.supportContent}
- 頻度: ${plan.supportGoals.socialLife.frequency}
- 評価: ${plan.supportGoals.socialLife.evaluation}
    `.trim()

    const prompt = generateQualityCheckPrompt(planText)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error:', errorText)
      return NextResponse.json(
        { error: 'AI APIでエラーが発生しました' },
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
      const qualityResult: QualityCheckResult = JSON.parse(content)
      return NextResponse.json(qualityResult)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      return NextResponse.json(
        { error: 'AIの応答形式が正しくありません' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}