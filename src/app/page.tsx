'use client'

import { useState } from 'react'
import { HomePageState, FacilitySettings } from '@/lib/types'
import { validateInterviewRecord, ValidationResult } from '@/lib/validation'
import FacilitySettingsPanel from '@/components/FacilitySettingsPanel'
import InterviewRecordInput from '@/components/InterviewRecordInput'
import SupportPlanDisplay from '@/components/SupportPlanDisplay'
import ValidationWarnings from '@/components/ValidationWarnings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Info } from 'lucide-react'

const defaultFacilitySettings: FacilitySettings = {
  facilityType: 'employment-b',
  workTypes: [],
  facilityFeatures: [],
  userCharacteristics: {
    ageGroup: '',
    disabilityTypes: [],
    averageUsagePeriod: '',
    userCount: ''
  }
}

export default function HomePage() {
  const [state, setState] = useState<HomePageState>({
    interviewRecord: '',
    facilitySettings: defaultFacilitySettings,
    generatedPlan: null,
    isGenerating: false,
    error: null
  })

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const handleFacilitySettingsChange = (settings: FacilitySettings) => {
    setState(prev => ({
      ...prev,
      facilitySettings: settings
    }))
  }

  const handleInterviewRecordChange = (value: string) => {
    setState(prev => ({
      ...prev,
      interviewRecord: value
    }))
    
    // リアルタイムバリデーション
    if (value.trim().length > 0) {
      const validation = validateInterviewRecord(value)
      setValidationResult(validation)
    } else {
      setValidationResult(null)
    }
  }

  const generatePlan = async () => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }))

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewRecord: state.interviewRecord,
          facilitySettings: state.facilitySettings,
          requestType: 'standard'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'エラーが発生しました')
      }

      const data = await response.json()
      setState(prev => ({
        ...prev,
        generatedPlan: data.plan,
        isGenerating: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '予期しないエラーが発生しました',
        isGenerating: false
      }))
    }
  }


  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* エラー表示 */}
      {state.error && (
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              エラーが発生しました
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive mb-3">{state.error}</p>
            <button 
              onClick={clearError}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              エラーを閉じる
            </button>
          </CardContent>
        </Card>
      )}

      {/* 使用方法の説明 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            使用方法
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-800 space-y-2 mb-4">
            <p className="font-medium">📝 <strong>面談記録のみでも書類作成可能です</strong></p>
            <p>事業所設定は任意項目のため、面談記録を入力するだけでも個別支援計画書を生成できます。</p>
          </div>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>（任意）事業所の特性を設定してください</li>
            <li>利用者との面談記録を入力してください</li>
            <li>「個別支援計画書を生成」ボタンを押してください</li>
            <li>必要に応じて品質チェックや代替案を生成してください</li>
          </ol>
        </CardContent>
      </Card>

      {/* 事業所設定 */}
      <FacilitySettingsPanel
        settings={state.facilitySettings}
        onChange={handleFacilitySettingsChange}
      />

      {/* 面談記録入力 */}
      <InterviewRecordInput
        value={state.interviewRecord}
        onChange={handleInterviewRecordChange}
        onGenerate={generatePlan}
        isGenerating={state.isGenerating}
      />

      {/* バリデーション警告 */}
      {validationResult && (
        <ValidationWarnings validationResult={validationResult} />
      )}

      {/* 生成された計画書 */}
      {state.generatedPlan && (
        <SupportPlanDisplay plan={state.generatedPlan} />
      )}


      {/* セキュリティ注意事項 */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-800 text-sm">
            セキュリティについて
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-600">
            このシステムは入力されたデータをサーバーに保存しません。
            すべての処理はブラウザ内またはセキュアなAPI経由で行われ、ページを閉じると入力内容は削除されます。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}