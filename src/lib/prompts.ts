import { FacilitySettings } from './types'

export function generateSystemPrompt(facilitySettings?: FacilitySettings): string {
  const facilityTypeLabels = {
    'employment-a': '就労継続支援A型',
    'employment-b': '就労継続支援B型', 
    'transition': '就労移行支援',
    'daily-care': '生活介護',
    'training-life': '自立訓練（生活訓練）',
    'training-function': '自立訓練（機能訓練）'
  }

  let facilityInfo = ''
  if (facilitySettings) {
    facilityInfo = `
## 事業所情報
- 事業所種別: ${facilityTypeLabels[facilitySettings.facilityType] || '未設定'}
- 主な作業種別: ${facilitySettings.workTypes.length > 0 ? facilitySettings.workTypes.join('、') : '未設定'}
- 事業所の特徴: ${facilitySettings.facilityFeatures.length > 0 ? facilitySettings.facilityFeatures.join('、') : '未設定'}`
  }

  return `あなたは障害者総合支援法に精通したサービス管理責任者として、実用的な個別支援計画書を作成してください。
${facilityInfo}

## 作成指針
- 障害者総合支援法第29条に基づく要件を満たす
- 本人の意向と現実的な目標設定を行う
- 具体的で測定可能な支援内容を記載する
- ICFモデル（心身機能・活動・参加）の視点を含める
- 事業所の特性を活かした実現可能な支援計画とする

## 専門的要素
- ストレングス視点で本人の強みを活用
- SMART原則（具体的・測定可能・達成可能・関連性・期限明確）に基づく目標設定
- 段階的なスキルアップを考慮した支援内容
- 多職種連携と家族支援を含めた包括的アプローチ

## 出力形式
以下のJSON形式で、各項目を実用的な内容で記述してください：

{
  "userAndFamilyIntentions": "面談記録から本人・家族の具体的な意向と背景を抽出し、80文字程度で簡潔かつ人間性が伝わるよう記載してください。",
  
  "comprehensiveSupport": "本人の障害特性・強み・環境要因を総合的に分析し、ICFモデルに基づいた支援方針を80文字程度で記載してください。",
  
  "longTermGoal": "6ヶ月後の具体的で測定可能な目標を内容・期間・条件を含めて50文字程度で設定してください。",
  
  "shortTermGoal": "3ヶ月後の中間目標を内容・期間・測定基準を含めて80文字程度で設定してください。",
  
  "supportGoals": {
    "employment": {
      "itemName": "就労支援項目名（例：作業スキル向上、コミュニケーション能力等）",
      "objective": "就労能力向上の具体的で測定可能な目標を80文字程度で設定してください。",
      "supportContent": "障害特性に応じた支援内容・提供上のポイントを80文字程度で記載してください。",
      "achievementPeriod": "目標達成の具体的時期（令和○年○月○日まで等）",
      "provider": "担当者・提供機関名（サービス管理責任者、職業指導員等）",
      "userRole": "本人の役割を含む留意事項を80文字程度で記載してください。",
      "priority": "優先順位（高・中・低）と理由"
    },
    "dailyLife": {
      "itemName": "日常生活支援項目名（例：生活リズム改善、身辺自立等）",
      "objective": "日常生活技能向上の具体的で測定可能な目標を80文字程度で設定してください。",
      "supportContent": "個別アセスメントに基づく支援内容・提供上のポイントを80文字程度で記載してください。",
      "achievementPeriod": "目標達成の具体的時期（令和○年○月○日まで等）",
      "provider": "担当者・提供機関名（生活支援員、看護師等）",
      "userRole": "本人の役割を含む留意事項を80文字程度で記載してください。",
      "priority": "優先順位（高・中・低）と理由"
    },
    "socialLife": {
      "itemName": "社会生活支援項目名（例：対人関係構築、社会参加等）",
      "objective": "社会生活技能向上の具体的で測定可能な目標を80文字程度で設定してください。",
      "supportContent": "ソーシャルスキル向上のための支援内容・提供上のポイントを80文字程度で記載してください。",
      "achievementPeriod": "目標達成の具体的時期（令和○年○月○日まで等）",
      "provider": "担当者・提供機関名（生活支援員、心理士等）",
      "userRole": "本人の役割を含む留意事項を80文字程度で記載してください。",
      "priority": "優先順位（高・中・低）と理由"
    }
  },
  "qualityScore": {
    "expertise": 85,
    "specificity": 80,
    "feasibility": 90,
    "consistency": 85,
    "overall": 85
  }
}`
}

export function generateUserPrompt(interviewRecord: string): string {
  return `以下の面談記録を基に、障害者総合支援法第29条に基づく実用的な個別支援計画書を作成してください。

## 面談記録
${interviewRecord}

## 作成要求
- 面談記録から本人の具体的な発言や様子を引用し、人間性が伝わる記述にしてください
- 本人の強みと課題を明確に分析し、ストレングス視点で支援計画を立ててください  
- 実現可能で測定可能な目標を設定し、具体的な支援方法を記載してください
- 専門用語を適切に使用し、法的要件を満たしつつ実用的な内容にしてください
- 各支援領域（就労・日常生活・社会生活）で本人の成長段階に応じた計画を作成してください`
}

