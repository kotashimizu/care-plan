'use client'

import { useState, useEffect } from 'react'
import { FacilitySettings } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Plus, X } from 'lucide-react'

interface FacilitySettingsPanelProps {
  settings: FacilitySettings
  onChange: (settings: FacilitySettings) => void
}

const facilityTypeOptions = [
  { value: 'employment-a', label: '就労継続支援A型' },
  { value: 'employment-b', label: '就労継続支援B型' },
  { value: 'transition', label: '就労移行支援' },
  { value: 'daily-care', label: '生活介護' },
  { value: 'training-life', label: '自立訓練（生活訓練）' },
  { value: 'training-function', label: '自立訓練（機能訓練）' },
]

const disabilityTypeOptions = [
  '身体障害', '知的障害', '精神障害', '発達障害'
]

const workTypeOptions = [
  '軽作業（組立・包装・検品）',
  '清掃作業',
  'データ入力',
  '農業・園芸作業',
  '食品加工・調理補助',
  'リサイクル作業',
  '印刷・製本作業',
  '木工・手工芸',
  '事務作業',
  'クリーニング作業',
  '配送・運搬作業',
  'IT関連作業',
  'その他'
]

const facilityFeatureOptions = [
  '個別対応重視',
  '少人数制',
  '専門スタッフ充実',
  '送迎サービスあり',
  '医療連携体制',
  '就労移行支援実績豊富',
  '企業実習機会多数',
  'IT設備充実',
  '相談支援事業併設',
  '地域密着型',
  '資格取得支援',
  'バリアフリー設備完備',
  'その他'
]

const ageGroupOptions = [
  '18歳〜25歳中心',
  '20代中心',
  '30代中心',
  '40代中心',
  '50代以上中心',
  '20代〜30代中心',
  '30代〜40代中心',
  '40代〜50代中心',
  '幅広い年齢層'
]

const usagePeriodOptions = [
  '6ヶ月未満',
  '6ヶ月〜1年',
  '1年〜2年',
  '2年〜3年',
  '3年以上',
  '継続利用中心'
]

const userCountOptions = [
  '10名以下',
  '11名〜20名',
  '21名〜30名',
  '31名〜40名',
  '41名〜50名',
  '51名以上'
]

export default function FacilitySettingsPanel({ settings, onChange }: FacilitySettingsPanelProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleFacilityTypeChange = (value: string) => {
    onChange({
      ...settings,
      facilityType: value as FacilitySettings['facilityType']
    })
  }

  const handleWorkTypeChange = (workType: string, checked: boolean) => {
    const newWorkTypes = checked
      ? [...settings.workTypes, workType]
      : settings.workTypes.filter(w => w !== workType)
    
    onChange({
      ...settings,
      workTypes: newWorkTypes
    })
  }


  const handleFeatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value && !settings.facilityFeatures.includes(value)) {
      onChange({
        ...settings,
        facilityFeatures: [...settings.facilityFeatures, value]
      })
    }
  }

  const removeFeature = (index: number) => {
    onChange({
      ...settings,
      facilityFeatures: settings.facilityFeatures.filter((_, i) => i !== index)
    })
  }

  const handleDisabilityTypeChange = (disability: string, checked: boolean) => {
    const newDisabilities = checked
      ? [...settings.userCharacteristics.disabilityTypes, disability]
      : settings.userCharacteristics.disabilityTypes.filter(d => d !== disability)
    
    onChange({
      ...settings,
      userCharacteristics: {
        ...settings.userCharacteristics,
        disabilityTypes: newDisabilities
      }
    })
  }

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>事業所設定</CardTitle>
          <CardDescription>
            事業所の特性を設定して、より適切な個別支援計画書を生成します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card suppressHydrationWarning>
      <CardHeader>
        <CardTitle>事業所設定（任意）</CardTitle>
        <CardDescription>
          事業所種別のみ設定することで、より適切な個別支援計画書を生成できます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" suppressHydrationWarning>
        <div>
          <label className="text-sm font-medium mb-3 block">事業所種別</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {facilityTypeOptions.map(option => (
              <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="facilityType"
                  value={option.value}
                  checked={settings.facilityType === option.value}
                  onChange={(e) => handleFacilityTypeChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}