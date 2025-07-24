'use client'

import { useState } from 'react'
import { IndividualSupportPlan } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, CheckCircle, FileText, Target, Calendar, User, Heart } from 'lucide-react'

interface SupportPlanDisplayProps {
  plan: IndividualSupportPlan | null
}

export default function SupportPlanDisplay({ plan }: SupportPlanDisplayProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  if (!plan) return null

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
${plan.userAndFamilyIntentions}

■ 総合的な支援の方針
${plan.comprehensiveSupport}

■ 長期目標
${plan.longTermGoal}

■ 短期目標
${plan.shortTermGoal}

■ 支援目標

【就労に関する支援】
目標: ${plan.supportGoals.employment.objective}
ご本人の役割: ${plan.supportGoals.employment.userRole}
支援内容: ${plan.supportGoals.employment.supportContent}
頻度: ${plan.supportGoals.employment.frequency}
評価方法: ${plan.supportGoals.employment.evaluation}

【日常生活に関する支援】
目標: ${plan.supportGoals.dailyLife.objective}
ご本人の役割: ${plan.supportGoals.dailyLife.userRole}
支援内容: ${plan.supportGoals.dailyLife.supportContent}
頻度: ${plan.supportGoals.dailyLife.frequency}
評価方法: ${plan.supportGoals.dailyLife.evaluation}

【社会生活に関する支援】
目標: ${plan.supportGoals.socialLife.objective}
ご本人の役割: ${plan.supportGoals.socialLife.userRole}
支援内容: ${plan.supportGoals.socialLife.supportContent}
頻度: ${plan.supportGoals.socialLife.frequency}
評価方法: ${plan.supportGoals.socialLife.evaluation}
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
      objective: string
      userRole: string
      supportContent: string
      frequency: string
      evaluation: string
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
目標: ${goal.objective}
ご本人の役割: ${goal.userRole}
支援内容: ${goal.supportContent}
頻度: ${goal.frequency}
評価方法: ${goal.evaluation}
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
            <h4 className="font-medium text-sm text-muted-foreground mb-1">目標</h4>
            <p className="text-sm">{goal.objective}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">ご本人の役割</h4>
            <p className="text-sm">{goal.userRole}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">支援内容</h4>
            <p className="text-sm">{goal.supportContent}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">頻度</h4>
              <p className="text-sm">{goal.frequency}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">評価方法</h4>
              <p className="text-sm">{goal.evaluation}</p>
            </div>
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

      <div className="grid gap-4">
        <SectionCard
          title="ご本人・ご家族の意向"
          content={plan.userAndFamilyIntentions}
          icon={Heart}
          sectionKey="intentions"
        />

        <SectionCard
          title="総合的な支援の方針"
          content={plan.comprehensiveSupport}
          icon={Target}
          sectionKey="comprehensive"
        />

        <div className="grid md:grid-cols-2 gap-4">
          <SectionCard
            title="長期目標"
            content={plan.longTermGoal}
            icon={Target}
            sectionKey="longTerm"
          />

          <SectionCard
            title="短期目標"
            content={plan.shortTermGoal}
            icon={Calendar}
            sectionKey="shortTerm"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">支援目標</h3>
          
          <SupportGoalCard
            title="就労に関する支援"
            goal={plan.supportGoals.employment}
            icon={Target}
            sectionKey="employment"
          />

          <SupportGoalCard
            title="日常生活に関する支援"
            goal={plan.supportGoals.dailyLife}
            icon={User}
            sectionKey="dailyLife"
          />

          <SupportGoalCard
            title="社会生活に関する支援"
            goal={plan.supportGoals.socialLife}
            icon={Heart}
            sectionKey="socialLife"
          />
        </div>
      </div>
    </div>
  )
}