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

  // 事業種別特化の重点指針を追加
  const getServiceTypeGuidance = (facilityType: string): string => {
    switch (facilityType) {
      case 'employment-b':
        return `
## B型事業所特化指針
- 生活リズム安定化を適度に含める（昼夜逆転等の生活習慣改善）
- 作業継続性・通所継続を重視した段階的目標設定
- 本人ペースを尊重した継続可能な支援計画を作成
- 作業スキル向上と生活スキルのバランスを考慮`

      case 'employment-a':
        return `
## A型事業所特化指針  
- 雇用契約に基づく就労継続支援を重視
- 生産性向上と作業効率を考慮した目標設定
- 一般就労移行への準備も視野に入れた支援計画
- 作業スキルと職業適応スキルの統合的向上`

      case 'transition':
        return `
## 就労移行支援事業所特化指針
- 2年間の有期限支援を前提とした集中的な計画
- 一般就労に向けた実践的スキル習得を重視
- 企業実習・職場体験を見据えた具体的目標設定
- ビジネスマナー・職業準備性の段階的向上`

      case 'daily-care':
        return `
## 生活介護事業所特化指針
- 金銭管理・買い物等の実生活スキルを重視
- ADL（日常生活動作）の詳細な支援計画を含める
- 多職種連携による包括的支援を前提とした目標設定
- 地域生活継続のための社会参加・余暇活動も考慮`

      case 'training-life':
        return `
## 自立訓練（生活訓練）事業所特化指針
- 地域生活移行・継続のための生活能力向上を重視
- 金銭管理・家事・外出等の具体的生活スキル習得
- 2年間の有期限支援での段階的自立支援計画
- 相談支援事業所等との連携を含めた移行支援`

      case 'training-function':
        return `
## 自立訓練（機能訓練）事業所特化指針
- 身体機能・生活機能の維持・向上を重視
- ADL・IADL（手段的日常生活動作）の具体的改善目標
- 医療・リハビリ専門職との連携による機能訓練
- 福祉用具・環境整備を含めた包括的支援計画`

      default:
        return ''
    }
  }

  let facilityInfo = ''
  let serviceGuidance = ''
  
  if (facilitySettings) {
    facilityInfo = `
## 事業所情報
- 事業所種別: ${facilityTypeLabels[facilitySettings.facilityType] || '未設定'}
- 主な作業種別: ${facilitySettings.workTypes.length > 0 ? facilitySettings.workTypes.join('、') : '未設定'}
- 事業所の特徴: ${facilitySettings.facilityFeatures.length > 0 ? facilitySettings.facilityFeatures.join('、') : '未設定'}`
    
    serviceGuidance = getServiceTypeGuidance(facilitySettings.facilityType)
  }

  return `あなたは障害者総合支援法に精通したサービス管理責任者として、実用的な個別支援計画書を作成してください。
${facilityInfo}
${serviceGuidance}

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

## 意思決定支援の重視（2024年4月〜）
- 本人の意思と希望を最優先に計画を作成
- 到達目標は本人の願望として表現
- 本人が主体的に取り組む役割を明確化
- 支援者は本人の意思を支える立場として記載

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
      "objective": "本人が希望する内容を『〜したい』『〜できるようになりたい』という形式で、本人の言葉として80文字程度で記載してください。例：『毎日通所して、みんなと一緒に作業ができるようになりたい』",
      "supportContent": "本人の希望を実現するために、支援者が『〜を支援します』『〜のサポートを行います』という形式で、具体的な支援内容を80文字程度で記載してください。",
      "achievementPeriod": "目標達成の具体的時期（令和○年○月○日まで等）",
      "provider": "担当者・提供機関名（サービス管理責任者、職業指導員等）",
      "userRole": "本人が取り組む内容を『〜します』『〜に取り組みます』という形式で、具体的な行動を80文字程度で記載してください。",
      "priority": "1"
    },
    "dailyLife": {
      "itemName": "日常生活支援項目名（例：生活リズム改善、身辺自立等）",
      "objective": "本人が希望する内容を『〜したい』『〜できるようになりたい』という形式で、本人の言葉として80文字程度で記載してください。例：『規則正しい生活リズムで過ごしたい』",
      "supportContent": "本人の希望を実現するために、支援者が『〜を支援します』『〜のサポートを行います』という形式で、具体的な支援内容を80文字程度で記載してください。",
      "achievementPeriod": "目標達成の具体的時期（令和○年○月○日まで等）",
      "provider": "担当者・提供機関名（生活支援員、看護師等）",
      "userRole": "本人が取り組む内容を『〜します』『〜に取り組みます』という形式で、具体的な行動を80文字程度で記載してください。",
      "priority": "2"
    },
    "socialLife": {
      "itemName": "社会生活支援項目名（例：対人関係構築、社会参加等）",
      "objective": "本人が希望する内容を『〜したい』『〜できるようになりたい』という形式で、本人の言葉として80文字程度で記載してください。例：『友達と楽しく話せるようになりたい』",
      "supportContent": "本人の希望を実現するために、支援者が『〜を支援します』『〜のサポートを行います』という形式で、具体的な支援内容を80文字程度で記載してください。",
      "achievementPeriod": "目標達成の具体的時期（令和○年○月○日まで等）",
      "provider": "担当者・提供機関名（生活支援員、心理士等）",
      "userRole": "本人が取り組む内容を『〜します』『〜に取り組みます』という形式で、具体的な行動を80文字程度で記載してください。",
      "priority": "3"
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
  return `以下の面談記録を基に、障害者総合支援法第29条に基づく実用的な個別支援計画書을 작성してください。

## 面談記録
${interviewRecord}

## 作成要求
- 面談記録から本人の具体的な発言や様子を引用し、人間性が伝わる記述にしてください
- 本人の強みと課題を明確に分析し、ストレングス視点で支援計画を立ててください  
- 実現可能で測定可能な目標を設定し、具体的な支援方法を記載してください
- 専門用語を適切に使用し、法的要件を満たしつつ実用的な内容にしてください
- 各支援領域（就労・日常生活・社会生活）で本人の成長段階に応じた計画を作成してください
- 各目標設定では、強み活用・課題解決・環境調整・関係性構築の複数視点を統合した質の高い支援計画としてください`
}