'use client'

import { InterviewRecordInputProps } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'
import { HelpTooltip } from '@/components/ui/help-tooltip'

export default function InterviewRecordInput({ 
  value, 
  onChange, 
  onGenerate, 
  isGenerating 
}: InterviewRecordInputProps) {
  const handleGenerateClick = () => {
    if (value.trim() && !isGenerating) {
      onGenerate()
    }
  }

  const isDisabled = !value.trim() || isGenerating

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          面談記録入力
        </CardTitle>
        <CardDescription>
          ご利用者様との面談内容を入力してください。ご本人の言葉をそのまま記載することで、より適切な支援計画を作成できます。
        </CardDescription>
        <HelpTooltip 
          content="ご本人の希望や気持ちを「〜したい」という形で記載すると、より良い計画書が作成されます" 
          className="mt-2"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            面談記録内容
            <span className="text-xs text-gray-500 ml-2">（ご本人の言葉をできるだけそのまま記載してください）</span>
          </label>
          <Textarea
            placeholder={`例:
【基本情報】
・年齢: 25歳、知的障害
・家族構成: 両親と3人暮らし

【本人の希望・意向】
「将来は一人暮らしをしたい。料理を覚えて、自分で生活できるようになりたい。」
「人と話すのは少し苦手だけど、みんなと一緒に作業をするのは楽しい。」

【現在の状況】
・日常生活: 身の回りのことはほぼ自立。料理は簡単なものなら可能
・コミュニケーション: 慣れた人とは良好。初対面の人には緊張する
・作業能力: 集中力があり、丁寧に作業を行える

【家族の意向】
「本人の希望を尊重したい。段階的に自立に向けて支援してほしい。」

【その他気づき】
・自己肯定感を高める支援が必要
・コミュニケーション能力の向上が課題`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[300px] resize-none"
            disabled={isGenerating}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            文字数: {value.length}
          </div>
          <Button 
            onClick={handleGenerateClick}
            disabled={isDisabled}
            className="w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              '個別支援計画書を生成'
            )}
          </Button>
        </div>

        {isDisabled && !isGenerating && (
          <p className="text-sm text-muted-foreground">
            面談記録を入力してから生成ボタンを押してください。
          </p>
        )}
      </CardContent>
    </Card>
  )
}