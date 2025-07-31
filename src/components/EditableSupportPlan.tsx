'use client'

import { useState } from 'react'
import ContentEditable from 'react-contenteditable'
import { IndividualSupportPlan, SupportGoal } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Save, X, Edit2, Target, Calendar, User, Heart } from 'lucide-react'

interface EditableSupportPlanProps {
  plan: IndividualSupportPlan
  onSave: (updatedPlan: IndividualSupportPlan) => void
  onCancel: () => void
}

export default function EditableSupportPlan({ plan, onSave, onCancel }: EditableSupportPlanProps) {
  const [editablePlan, setEditablePlan] = useState<IndividualSupportPlan>(plan)
  const [hasChanges, setHasChanges] = useState(false)

  const handleTextChange = (field: keyof IndividualSupportPlan, value: string) => {
    if (field === 'supportGoals' || field === 'qualityScore') return // これらは別途処理
    
    setEditablePlan(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleSupportGoalChange = (
    goalType: keyof IndividualSupportPlan['supportGoals'],
    field: keyof SupportGoal,
    value: string
  ) => {
    setEditablePlan(prev => ({
      ...prev,
      supportGoals: {
        ...prev.supportGoals,
        [goalType]: {
          ...prev.supportGoals[goalType],
          [field]: value
        }
      }
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(editablePlan)
    setHasChanges(false)
  }

  const handleCancel = () => {
    setEditablePlan(plan)
    setHasChanges(false)
    onCancel()
  }

  const EditableField = ({ 
    value, 
    onChange, 
    className = "",
    placeholder = "内容を入力してください..."
  }: {
    value: string
    onChange: (value: string) => void
    className?: string
    placeholder?: string
  }) => (
    <ContentEditable
      html={value || placeholder}
      disabled={false}
      onChange={(evt) => onChange(evt.target.value)}
      className={`
        min-h-[3rem] p-3 border border-gray-200 rounded-md 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        hover:border-gray-300 transition-colors
        ${!value ? 'text-gray-400' : 'text-gray-900'}
        ${className}
      `}
    />
  )

  const SectionCard = ({ 
    title, 
    value,
    onChange,
    icon: Icon
  }: { 
    title: string
    value: string
    onChange: (value: string) => void
    icon: React.ComponentType<{ className?: string }>
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EditableField 
          value={value}
          onChange={onChange}
        />
      </CardContent>
    </Card>
  )

  const SupportGoalCard = ({ 
    title, 
    goal,
    onChange,
    icon: Icon
  }: { 
    title: string
    goal: SupportGoal
    onChange: (field: keyof SupportGoal, value: string) => void
    icon: React.ComponentType<{ className?: string }>
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">項目</h4>
            <EditableField 
              value={goal.itemName}
              onChange={(value) => onChange('itemName', value)}
              placeholder="支援項目名を入力してください..."
            />
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">支援目標</h4>
            <EditableField 
              value={goal.objective}
              onChange={(value) => onChange('objective', value)}
              placeholder="具体的な目標を入力してください..."
            />
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">支援内容</h4>
            <EditableField 
              value={goal.supportContent}
              onChange={(value) => onChange('supportContent', value)}
              placeholder="支援内容・提供上のポイントを入力してください..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">達成時期</h4>
              <EditableField 
                value={goal.achievementPeriod}
                onChange={(value) => onChange('achievementPeriod', value)}
                placeholder="目標達成の具体的時期を入力してください..."
              />
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">担当者</h4>
              <EditableField 
                value={goal.provider}
                onChange={(value) => onChange('provider', value)}
                placeholder="担当者・提供機関名を入力してください..."
              />
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">留意事項（本人の役割を含む）</h4>
            <EditableField 
              value={goal.userRole}
              onChange={(value) => onChange('userRole', value)}
              placeholder="本人の役割や留意事項を入力してください..."
            />
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">優先順位</h4>
            <EditableField 
              value={goal.priority}
              onChange={(value) => onChange('priority', value)}
              placeholder="優先順位（高・中・低）と理由を入力してください..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Edit2 className="h-6 w-6" />
          編集モード - 個別支援計画書
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleCancel} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            キャンセル
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            保存
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            未保存の変更があります。保存またはキャンセルしてください。
          </p>
        </div>
      )}

      <div className="grid gap-4">
        <SectionCard
          title="ご本人・ご家族の意向"
          value={editablePlan.userAndFamilyIntentions}
          onChange={(value) => handleTextChange('userAndFamilyIntentions', value)}
          icon={Heart}
        />

        <SectionCard
          title="総合的な支援の方針"
          value={editablePlan.comprehensiveSupport}
          onChange={(value) => handleTextChange('comprehensiveSupport', value)}
          icon={Target}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <SectionCard
            title="長期目標"
            value={editablePlan.longTermGoal}
            onChange={(value) => handleTextChange('longTermGoal', value)}
            icon={Target}
          />

          <SectionCard
            title="短期目標"
            value={editablePlan.shortTermGoal}
            onChange={(value) => handleTextChange('shortTermGoal', value)}
            icon={Calendar}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">支援目標</h3>
          
          <SupportGoalCard
            title="就労に関する支援"
            goal={editablePlan.supportGoals.employment}
            onChange={(field, value) => handleSupportGoalChange('employment', field, value)}
            icon={Target}
          />

          <SupportGoalCard
            title="日常生活に関する支援"
            goal={editablePlan.supportGoals.dailyLife}
            onChange={(field, value) => handleSupportGoalChange('dailyLife', field, value)}
            icon={User}
          />

          <SupportGoalCard
            title="社会生活に関する支援"
            goal={editablePlan.supportGoals.socialLife}
            onChange={(field, value) => handleSupportGoalChange('socialLife', field, value)}
            icon={Heart}
          />
        </div>
      </div>
    </div>
  )
}