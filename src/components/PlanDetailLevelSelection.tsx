'use client'

import { PlanDetailLevel, ServiceType } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PlanDetailLevelSelectionProps {
  serviceType: ServiceType;
  onSelect: (detailLevel: PlanDetailLevel) => void;
  selectedLevel: PlanDetailLevel | null;
  onNext: () => void;
  isGenerating?: boolean;
}

export default function PlanDetailLevelSelection({ 
  serviceType, 
  onSelect, 
  selectedLevel,
  onNext,
  isGenerating = false
}: PlanDetailLevelSelectionProps) {
  const getServiceTypeName = (type: ServiceType) => {
    switch (type) {
      case 'employment-a':
        return '就労継続支援A型'
      case 'employment-b':
        return '就労継続支援B型'
      case 'daily-care':
        return '生活介護'
      default:
        return ''
    }
  }

  const detailLevels = [
    {
      type: 'basic' as PlanDetailLevel,
      title: '基本プラン',
      description: '緩やかなアプローチで基本的な支援内容',
      example: serviceType === 'employment-a' ? '決まった時間に作業を行う' :
               serviceType === 'employment-b' ? '自分のペースで作業に取り組む' :
               '決まった時間に活動に参加する',
      features: ['利用者の負担が少ない', '実行しやすい内容', 'シンプルなアプローチ']
    },
    {
      type: 'detailed' as PlanDetailLevel,
      title: '詳細プラン',
      description: 'より具体的で詳細な支援内容',
      example: serviceType === 'employment-a' ? '作業記録を毎日記入し、週1回振り返りを行う' :
               serviceType === 'employment-b' ? '作業内容を可視化し、月1回の評価面談を実施' :
               '活動記録をつけ、体調管理表を毎日記入する',
      features: ['具体的な実行方法', '詳細な記録・評価', '体系的なアプローチ']
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>支援プランの詳細度選択</CardTitle>
        <p className="text-sm text-gray-600">
          {getServiceTypeName(serviceType)}の支援プランの詳細度を選択してください
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {detailLevels.map((level) => (
          <div
            key={level.type}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedLevel === level.type 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(level.type)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{level.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                
                <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                  <p className="text-sm font-medium text-gray-700">例：</p>
                  <p className="text-sm text-gray-600 mt-1">{level.example}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {level.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ml-4 flex-shrink-0 ${
                selectedLevel === level.type
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedLevel === level.type && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {selectedLevel && (
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              className="px-8" 
              onClick={onNext}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  支援計画案を生成中...
                </>
              ) : (
                '支援計画案を生成'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}