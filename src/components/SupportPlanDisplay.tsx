'use client'

import { useState } from 'react'
import { IndividualSupportPlan } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, CheckCircle, FileText, Target, Calendar, User, Heart, Edit2 } from 'lucide-react'
import EditableSupportPlan from './EditableSupportPlan'

interface SupportPlanDisplayProps {
  plan: IndividualSupportPlan | null
  onPlanUpdate?: (updatedPlan: IndividualSupportPlan) => void
}

export default function SupportPlanDisplay({ plan, onPlanUpdate }: SupportPlanDisplayProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [displayPlan, setDisplayPlan] = useState(plan)

  if (!plan) return null

  const currentPlan = displayPlan || plan

  const handleEditSave = (updatedPlan: IndividualSupportPlan) => {
    setDisplayPlan(updatedPlan)
    setIsEditing(false)
    if (onPlanUpdate) {
      onPlanUpdate(updatedPlan)
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false)
  }

  // 編集モードの場合は EditableSupportPlan を表示
  if (isEditing) {
    return (
      <EditableSupportPlan
        plan={currentPlan}
        onSave={handleEditSave}
        onCancel={handleEditCancel}
      />
    )
  }

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const copyFullPlan = async () => {
    const fullText = `
【個別支援計画書】

■ ご本人・ご家族の意向
${currentPlan.userAndFamilyIntentions}

■ 総合的な支援の方針
${currentPlan.comprehensiveSupport}

■ 長期目標
${currentPlan.longTermGoal}

■ 短期目標
${currentPlan.shortTermGoal}

■ 支援目標

【就労に関する支援】
項目: ${currentPlan.supportGoals.employment.itemName}
支援目標: ${currentPlan.supportGoals.employment.objective}
支援内容: ${currentPlan.supportGoals.employment.supportContent}
達成時期: ${currentPlan.supportGoals.employment.achievementPeriod}
担当者: ${currentPlan.supportGoals.employment.provider}
留意事項: ${currentPlan.supportGoals.employment.userRole}
優先順位: ${currentPlan.supportGoals.employment.priority}

【日常生活に関する支援】
項目: ${currentPlan.supportGoals.dailyLife.itemName}
支援目標: ${currentPlan.supportGoals.dailyLife.objective}
支援内容: ${currentPlan.supportGoals.dailyLife.supportContent}
達成時期: ${currentPlan.supportGoals.dailyLife.achievementPeriod}
担当者: ${currentPlan.supportGoals.dailyLife.provider}
留意事項: ${currentPlan.supportGoals.dailyLife.userRole}
優先順位: ${currentPlan.supportGoals.dailyLife.priority}

【社会生活に関する支援】
項目: ${currentPlan.supportGoals.socialLife.itemName}
支援目標: ${currentPlan.supportGoals.socialLife.objective}
支援内容: ${currentPlan.supportGoals.socialLife.supportContent}
達成時期: ${currentPlan.supportGoals.socialLife.achievementPeriod}
担当者: ${currentPlan.supportGoals.socialLife.provider}
留意事項: ${currentPlan.supportGoals.socialLife.userRole}
優先順位: ${currentPlan.supportGoals.socialLife.priority}
    `.trim()
    
    await copyToClipboard(fullText, 'full')
  }

  const SectionCard = ({ 
    title, 
    content, 
    icon: Icon, 
    sectionKey 
  }: { 
    title: string
    content: string
    icon: React.ComponentType<{ className?: string }>
    sectionKey: string 
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(content, sectionKey)}
            className="h-8 w-8 p-0"
          >
            {copiedSection === sectionKey ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </CardContent>
    </Card>
  )

  const SupportGoalCard = ({ 
    title, 
    goal, 
    icon: Icon,
    sectionKey 
  }: { 
    title: string
    goal: {
      itemName: string
      objective: string
      supportContent: string
      achievementPeriod: string
      provider: string
      userRole: string
      priority: string
    }
    icon: React.ComponentType<{ className?: string }>
    sectionKey: string 
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(`
項目: ${goal.itemName}
支援目標: ${goal.objective}
支援内容: ${goal.supportContent}
達成時期: ${goal.achievementPeriod}
担当者: ${goal.provider}
留意事項: ${goal.userRole}
優先順位: ${goal.priority}
            `.trim(), sectionKey)}
            className="h-8 w-8 p-0"
          >
            {copiedSection === sectionKey ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">項目</h4>
            <p className="text-sm font-medium">{goal.itemName}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">支援目標</h4>
            <p className="text-sm">{goal.objective}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">支援内容</h4>
            <p className="text-sm">{goal.supportContent}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">達成時期</h4>
              <p className="text-sm">{goal.achievementPeriod}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">担当者</h4>
              <p className="text-sm">{goal.provider}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">留意事項（本人の役割を含む）</h4>
            <p className="text-sm">{goal.userRole}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">優先順位</h4>
            <p className="text-sm">{goal.priority}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          生成された個別支援計画書
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsEditing(true)} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            編集
          </Button>
          <Button onClick={copyFullPlan} variant="outline">
            {copiedSection === 'full' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                コピー完了
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                全体をコピー
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <SectionCard
          title="ご本人・ご家族の意向"
          content={currentPlan.userAndFamilyIntentions}
          icon={Heart}
          sectionKey="intentions"
        />

        <SectionCard
          title="総合的な支援の方針"
          content={currentPlan.comprehensiveSupport}
          icon={Target}
          sectionKey="comprehensive"
        />

        <div className="grid md:grid-cols-2 gap-4">
          <SectionCard
            title="長期目標"
            content={currentPlan.longTermGoal}
            icon={Target}
            sectionKey="longTerm"
          />

          <SectionCard
            title="短期目標"
            content={currentPlan.shortTermGoal}
            icon={Calendar}
            sectionKey="shortTerm"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">支援目標</h3>
          
          <SupportGoalCard
            title="就労に関する支援"
            goal={currentPlan.supportGoals.employment}
            icon={Target}
            sectionKey="employment"
          />

          <SupportGoalCard
            title="日常生活に関する支援"
            goal={currentPlan.supportGoals.dailyLife}
            icon={User}
            sectionKey="dailyLife"
          />

          <SupportGoalCard
            title="社会生活に関する支援"
            goal={currentPlan.supportGoals.socialLife}
            icon={Heart}
            sectionKey="socialLife"
          />
        </div>
      </div>
    </div>
  )
}