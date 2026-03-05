'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Eye, Save } from 'lucide-react'

type SupportGoal = {
  itemName: string
  objective: string
  supportContent: string
  achievementPeriod: string
  provider: string
  userRole: string
  priority: string
}

export interface PlanEditorValue {
  userAndFamilyIntentions: string
  comprehensiveSupport: string
  longTermGoal: string
  shortTermGoal: string
  supportGoals: Record<string, SupportGoal>
}

export interface UserInfo {
  userName: string
  createdYear: string
  createdMonth: string
  createdDay: string
  serviceManagerName: string
}

interface PlanEditorFormProps {
  value: PlanEditorValue
  onChange: (next: PlanEditorValue) => void
  onPreview: () => void
  onSavePdf: () => void
  userInfo: UserInfo
  onUserInfoChange: (userInfo: UserInfo) => void
}

export default function PlanEditorForm({ value, onChange, onPreview, onSavePdf, userInfo, onUserInfoChange }: PlanEditorFormProps) {
  const setField = (field: keyof PlanEditorValue, val: string) => {
    onChange({ ...value, [field]: val })
  }

  const setGoalField = (goalKey: string, field: keyof SupportGoal, val: string) => {
    onChange({
      ...value,
      supportGoals: {
        ...value.supportGoals,
        [goalKey]: {
          ...value.supportGoals[goalKey],
          [field]: val
        }
      }
    })
  }

  // サンプル適用・履歴管理は要望により削除しました

  const GoalFields = ({ goalKey, label }: { goalKey: string; label: string }) => {
    const goal = value.supportGoals[goalKey]
    if (!goal) return null
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{label}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">支援項目</label>
            <Input value={goal.itemName} onChange={(e) => setGoalField(goalKey, 'itemName', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">達成時期</label>
            <Input value={goal.achievementPeriod} onChange={(e) => setGoalField(goalKey, 'achievementPeriod', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">担当者</label>
            <Input value={goal.provider} onChange={(e) => setGoalField(goalKey, 'provider', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">優先度</label>
            <Input value={goal.priority} onChange={(e) => setGoalField(goalKey, 'priority', e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700">支援目標</label>
            <Textarea className="min-h-[80px]" value={goal.objective} onChange={(e) => setGoalField(goalKey, 'objective', e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700">支援内容</label>
            <Textarea className="min-h-[80px]" value={goal.supportContent} onChange={(e) => setGoalField(goalKey, 'supportContent', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">留意事項（本人の役割を含む）</label>
            <Textarea className="min-h-[80px]" value={goal.userRole} onChange={(e) => setGoalField(goalKey, 'userRole', e.target.value)} />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* アクションバー */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h2 className="text-xl font-semibold">3. 分析結果・編集</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" /> プレビュー
          </Button>
          <Button onClick={onSavePdf}>
            <Save className="h-4 w-4 mr-2" /> 保存・PDF出力
          </Button>
        </div>
      </div>

      {/* 利用者情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">利用者情報</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">利用者氏名</label>
            <Input 
              value={userInfo.userName} 
              onChange={(e) => onUserInfoChange({ ...userInfo, userName: e.target.value })}
              placeholder="例: 田中 太郎"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">作成年</label>
              <Input 
                value={userInfo.createdYear} 
                onChange={(e) => onUserInfoChange({ ...userInfo, createdYear: e.target.value })}
                placeholder={new Date().getFullYear().toString()}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">月</label>
              <Input 
                value={userInfo.createdMonth} 
                onChange={(e) => onUserInfoChange({ ...userInfo, createdMonth: e.target.value })}
                placeholder={(new Date().getMonth() + 1).toString()}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">日</label>
              <Input 
                value={userInfo.createdDay} 
                onChange={(e) => onUserInfoChange({ ...userInfo, createdDay: e.target.value })}
                placeholder={new Date().getDate().toString()}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">サービス管理責任者氏名</label>
            <Input 
              value={userInfo.serviceManagerName} 
              onChange={(e) => onUserInfoChange({ ...userInfo, serviceManagerName: e.target.value })}
              placeholder="例: 佐藤 花子"
            />
          </div>
        </CardContent>
      </Card>

      {/* 上部の基本項目 */}
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div>
            <label className="text-sm font-medium text-gray-700">利用者及び家族の生活に対する意向</label>
            <Textarea
              className="min-h-[120px]"
              placeholder="例: 利用者: 仲間と一緒に作業を続けながら、できることを増やしていきたい\n家族: 体調を崩さず、長く通所を続けてほしい"
              value={value.userAndFamilyIntentions}
              onChange={(e) => setField('userAndFamilyIntentions', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">総合的な支援の方針（必須）</label>
            <Textarea
              className="min-h-[120px]"
              placeholder="例: 本人の自主性を尊重し、個別のペースに合わせた支援を行う。家族との連携を図りながら、安全で充実した生活の実現を目指す。"
              value={value.comprehensiveSupport}
              onChange={(e) => setField('comprehensiveSupport', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">長期目標（1年）</label>
            <Textarea
              className="min-h-[80px]"
              placeholder="例: 安定した生活リズムを維持し、作業能力を向上させる（1年間）"
              value={value.longTermGoal}
              onChange={(e) => setField('longTermGoal', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">短期目標（3ヶ月）</label>
            <Textarea
              className="min-h-[80px]"
              placeholder="例: 週3日以上の安定した通所を継続する（6ヶ月）"
              value={value.shortTermGoal}
              onChange={(e) => setField('shortTermGoal', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 支援領域ごとの詳細入力 */}
      <GoalFields goalKey="employment" label="支援領域A：就労・作業に関する支援" />
      <GoalFields goalKey="dailyLife" label="支援領域B：日常生活・健康に関する支援" />
      <GoalFields goalKey="socialLife" label="支援領域C：社会参加・人間関係に関する支援" />
    </div>
  )
}


