'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Settings, Eye, FileDown } from 'lucide-react'

interface PDFContentFilterProps {
  onFilterChange: (selectedSections: string[]) => void;
  onPreview: () => void;
  onDownload: () => void;
  isPreviewMode?: boolean;
}

export default function PDFContentFilter({ 
  onFilterChange, 
  onPreview, 
  onDownload,
  isPreviewMode = false
}: PDFContentFilterProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'header',
    'intentions',
    'comprehensive',
    'goals',
    'employment',
    'dailyLife',
    'socialLife'
  ])

  const sections = [
    {
      id: 'header',
      label: 'ヘッダー情報',
      description: 'タイトル、事業区分、作成日',
      category: 'basic'
    },
    {
      id: 'intentions',
      label: 'ご本人・ご家族の意向',
      description: '利用者とご家族の希望や要望',
      category: 'basic'
    },
    {
      id: 'comprehensive',
      label: '総合的な支援の方針',
      description: '支援の全体的な方針と方向性',
      category: 'basic'
    },
    {
      id: 'goals',
      label: '長期・短期目標',
      description: '達成すべき長期目標と短期目標',
      category: 'goals'
    },
    {
      id: 'employment',
      label: '就労・作業に関する支援',
      description: 'A項目の支援内容',
      category: 'support'
    },
    {
      id: 'dailyLife',
      label: '日常生活・健康に関する支援',
      description: 'B項目の支援内容',
      category: 'support'
    },
    {
      id: 'socialLife',
      label: '社会参加・人間関係に関する支援',
      description: 'C項目の支援内容',
      category: 'support'
    }
  ]

  const handleSectionToggle = (sectionId: string) => {
    const newSelection = selectedSections.includes(sectionId)
      ? selectedSections.filter(id => id !== sectionId)
      : [...selectedSections, sectionId]
    
    setSelectedSections(newSelection)
    onFilterChange(newSelection)
  }

  const handleSelectAll = () => {
    const allSections = sections.map(s => s.id)
    setSelectedSections(allSections)
    onFilterChange(allSections)
  }

  const handleSelectNone = () => {
    setSelectedSections([])
    onFilterChange([])
  }

  const categoryLabels = {
    basic: '基本情報',
    goals: '目標設定',
    support: '支援内容'
  }

  const groupedSections = sections.reduce((groups, section) => {
    const category = section.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(section)
    return groups
  }, {} as Record<string, typeof sections>)

  return (
    <Card className="print:hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          PDF出力設定
        </CardTitle>
        <p className="text-sm text-gray-600">
          PDFに含める項目を選択してください（{selectedSections.length}項目選択中）
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 一括選択ボタン */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSelectAll}>
            すべて選択
          </Button>
          <Button size="sm" variant="outline" onClick={handleSelectNone}>
            すべて解除
          </Button>
        </div>

        {/* セクション選択 */}
        <div className="space-y-4">
          {Object.entries(groupedSections).map(([category, sectionList]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h4>
              <div className="space-y-2">
                {sectionList.map((section) => (
                  <div
                    key={section.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedSections.includes(section.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSectionToggle(section.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={() => handleSectionToggle(section.id)}
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{section.label}</h5>
                        <p className="text-xs text-gray-600 mt-1">{section.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            onClick={onPreview}
            disabled={selectedSections.length === 0}
            className="flex-1"
            variant={isPreviewMode ? "default" : "outline"}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'プレビュー中' : 'プレビュー'}
          </Button>
          <Button 
            onClick={onDownload}
            disabled={selectedSections.length === 0}
            className="flex-1"
          >
            <FileDown className="h-4 w-4 mr-2" />
            PDF出力
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}