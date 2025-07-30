import { FacilitySettings } from './types'

export function generateSystemPrompt(facilitySettings?: FacilitySettings): string {
  return `個別支援計画書を作成してください。以下のJSON形式で簡潔に出力：

{
  "userAndFamilyIntentions": "本人・家族の希望と不安",
  "comprehensiveSupport": "支援方針",
  "longTermGoal": "6ヶ月後の目標",
  "shortTermGoal": "3ヶ月後の目標",
  "supportGoals": {
    "employment": {"objective": "就労目標", "userRole": "本人の取組", "supportContent": "支援内容", "frequency": "頻度", "evaluation": "評価方法"},
    "dailyLife": {"objective": "生活目標", "userRole": "本人の取組", "supportContent": "支援内容", "frequency": "頻度", "evaluation": "評価方法"},
    "socialLife": {"objective": "社会参加目標", "userRole": "本人の取組", "supportContent": "支援内容", "frequency": "頻度", "evaluation": "評価方法"}
  },
  "qualityScore": {"expertise": 80, "specificity": 75, "feasibility": 85, "consistency": 80, "overall": 80}
}`
}

export function generateUserPrompt(interviewRecord: string): string {
  return `面談記録: ${interviewRecord}`
}

export function generateQualityCheckPrompt(plan: string): string {
  return `以下の計画書を評価してください：
${plan}

JSON形式で出力：
{
  "score": {"expertise": 数値, "specificity": 数値, "feasibility": 数値, "consistency": 数値, "overall": 数値},
  "improvements": ["改善提案1", "改善提案2"],
  "suggestions": ["検討事項1", "検討事項2"]
}`
}