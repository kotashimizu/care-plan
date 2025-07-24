'use client'

import { QualityCheckResult } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, TrendingUp, Star, Lightbulb } from 'lucide-react'

interface QualityCheckProps {
  qualityResult: QualityCheckResult | null
  isLoading: boolean
  onRunQualityCheck: () => void
}

export default function QualityCheck({ qualityResult, isLoading, onRunQualityCheck }: QualityCheckProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  const ScoreCard = ({ label, score }: { label: string; score: number }) => (
    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
        <Badge variant={getScoreBadgeVariant(score)} className="text-xs">
          {score >= 80 ? '優良' : score >= 60 ? '良好' : '要改善'}
        </Badge>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          品質チェック
        </CardTitle>
        <CardDescription>
          生成された個別支援計画書の品質を評価し、改善提案を提供します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qualityResult ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              個別支援計画書の品質チェックを実行してください
            </p>
            <Button onClick={onRunQualityCheck} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  分析中...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  品質チェックを実行
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 総合スコア */}
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">総合品質スコア</h3>
              <div className="flex items-center justify-center gap-3">
                <span className={`text-4xl font-bold ${getScoreColor(qualityResult.score.overall)}`}>
                  {qualityResult.score.overall}
                </span>
                <Badge variant={getScoreBadgeVariant(qualityResult.score.overall)} className="text-lg px-3 py-1">
                  {qualityResult.score.overall >= 80 ? '優秀' : 
                   qualityResult.score.overall >= 60 ? '良好' : '要改善'}
                </Badge>
              </div>
            </div>

            {/* 詳細スコア */}
            <div className="space-y-3">
              <h4 className="font-semibold">詳細評価</h4>
              <ScoreCard label="専門性" score={qualityResult.score.expertise} />
              <ScoreCard label="具体性" score={qualityResult.score.specificity} />
              <ScoreCard label="実現可能性" score={qualityResult.score.feasibility} />
              <ScoreCard label="一貫性" score={qualityResult.score.consistency} />
            </div>

            {/* 改善提案 */}
            {qualityResult.improvements.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  改善提案
                </h4>
                <div className="space-y-2">
                  {qualityResult.improvements.map((improvement, index) => (
                    <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 提案事項 */}
            {qualityResult.suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  追加提案
                </h4>
                <div className="space-y-2">
                  {qualityResult.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={onRunQualityCheck} 
              variant="outline" 
              className="w-full"
              disabled={isLoading}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              再分析する
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}