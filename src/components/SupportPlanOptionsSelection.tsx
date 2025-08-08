'use client'

import { SupportPlanOption } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface SupportPlanOptionsSelectionProps {
  options: SupportPlanOption[];
  selectedOptions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onNext: () => void;
  isGenerating?: boolean;
}

export default function SupportPlanOptionsSelection({
  options,
  selectedOptions,
  onSelectionChange,
  onNext,
  isGenerating = false
}: SupportPlanOptionsSelectionProps) {
  const handleOptionToggle = (optionId: string) => {
    const newSelection = selectedOptions.includes(optionId)
      ? selectedOptions.filter(id => id !== optionId)
      : [...selectedOptions, optionId]
    
    onSelectionChange(newSelection)
  }

  const categoryOptions = {
    A: options.filter(option => option.category === 'A'),
    B: options.filter(option => option.category === 'B'),
    C: options.filter(option => option.category === 'C')
  }

  const categoryTitles = {
    A: 'A項目：就労・作業に関する支援',
    B: 'B項目：日常生活・健康に関する支援', 
    C: 'C項目：社会参加・人間関係に関する支援'
  }

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">支援計画案を生成中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>支援計画オプション選択</CardTitle>
        <p className="text-sm text-gray-600">
          個別支援計画書に含める項目を選択してください（複数選択可能）
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {(['A', 'B', 'C'] as const).map((category) => (
          <div key={category} className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-800">
              {categoryTitles[category]}
            </h3>
            <div className="grid gap-3">
              {categoryOptions[category].map((option) => (
                <div
                  key={option.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedOptions.includes(option.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleOptionToggle(option.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={() => handleOptionToggle(option.id)}
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={option.id}
                        className="font-medium text-gray-900 cursor-pointer block"
                      >
                        {option.title}
                      </label>
                      <p className="text-sm text-gray-600 mt-2">
                        {option.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {selectedOptions.length > 0 && (
          <div className="flex flex-col items-center pt-6 space-y-3">
            <p className="text-sm text-gray-600">
              {selectedOptions.length}項目が選択されています
            </p>
            <Button size="lg" className="px-8" onClick={onNext}>
              選択した項目で計画書を作成
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}