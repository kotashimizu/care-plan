'use client'

import { useState } from 'react'
import { HomePageState, FacilitySettings, ServiceType, PlanDetailLevel } from '@/lib/types'
import { validateInterviewRecord, ValidationResult } from '@/lib/validation'
import ConsentScreen from '@/components/ConsentScreen'
import ServiceSelection from '@/components/ServiceSelection'
import SelectedServiceDisplay from '@/components/SelectedServiceDisplay'
import PlanDetailLevelSelection from '@/components/PlanDetailLevelSelection'
import InterviewRecordInput from '@/components/InterviewRecordInput'
import SupportPlanOptionsSelection from '@/components/SupportPlanOptionsSelection'
import SelectedPlanPDFView from '@/components/SelectedPlanPDFView'
import ValidationWarnings from '@/components/ValidationWarnings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Info, ArrowLeft } from 'lucide-react'

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
  const [consented, setConsented] = useState(false)
  const [accessToken, setAccessToken] = useState('')

  const [state, setState] = useState<HomePageState>({
    interviewRecord: '',
    facilitySettings: defaultFacilitySettings,
    generatedPlan: null,
    isGenerating: false,
    error: null,
    serviceType: null,
    planDetailLevel: null,
    supportPlanOptions: [],
    selectedOptions: [],
    currentStep: 'service-selection',
    userAndFamilyIntentions: null,
    comprehensiveSupport: null
  })

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  // 認証付きfetchヘルパー
  const authFetch = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
      },
    })
  }

  // 同意完了ハンドラー
  const handleConsent = (password: string) => {
    setAccessToken(password)
    setConsented(true)
  }

  // 同意前は同意画面を表示
  if (!consented) {
    return <ConsentScreen onConsent={handleConsent} />
  }

  const handleServiceSelection = (serviceType: ServiceType) => {
    setState(prev => ({
      ...prev,
      serviceType,
      currentStep: 'data-input'
    }))
  }

  const handleDetailLevelSelection = (detailLevel: PlanDetailLevel) => {
    setState(prev => ({
      ...prev,
      planDetailLevel: detailLevel,
      currentStep: 'detail-level'
    }))
  }

  const handleGenerateOptions = async () => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }))

    try {
      const response = await authFetch('/api/generate-options', {
        method: 'POST',
        body: JSON.stringify({
          interviewRecord: state.interviewRecord,
          serviceType: state.serviceType,
          planDetailLevel: state.planDetailLevel,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'エラーが発生しました')
      }

      const data = await response.json()
      setState(prev => ({
        ...prev,
        supportPlanOptions: data.options || [],
        userAndFamilyIntentions: data.userAndFamilyIntentions || null,
        comprehensiveSupport: data.comprehensiveSupport || null,
        currentStep: 'plan-selection',
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

  const handleOptionsSelectionChange = (selectedIds: string[]) => {
    setState(prev => ({ ...prev, selectedOptions: selectedIds }))
  }

  const handleCreatePDF = () => {
    setState(prev => ({ ...prev, currentStep: 'plan-generation' }))
  }

  const handleBackToSelection = () => {
    setState(prev => ({ ...prev, currentStep: 'plan-selection' }))
  }

  const handleInterviewRecordChange = (value: string) => {
    setState(prev => ({ ...prev, interviewRecord: value }))

    if (value.trim().length > 0) {
      const validation = validateInterviewRecord(value)
      setValidationResult(validation)
    } else {
      setValidationResult(null)
    }
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'service-selection':
        return (
          <ServiceSelection
            onSelect={handleServiceSelection}
            selectedService={state.serviceType}
          />
        )

      case 'data-input':
        return (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">データ入力</h2>
              <Button
                variant="outline"
                onClick={() => setState(prev => ({
                  ...prev,
                  currentStep: 'service-selection',
                  serviceType: null
                }))}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                事業選択に戻る
              </Button>
            </div>

            <SelectedServiceDisplay serviceType={state.serviceType!} />

            <InterviewRecordInput
              value={state.interviewRecord}
              onChange={handleInterviewRecordChange}
              onGenerate={() => setState(prev => ({
                ...prev,
                currentStep: 'detail-level'
              }))}
              isGenerating={false}
            />

            {validationResult && (
              <ValidationWarnings validationResult={validationResult} />
            )}
          </>
        )

      case 'detail-level':
        return (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">プラン詳細度選択</h2>
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, currentStep: 'data-input' }))}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                データ入力に戻る
              </Button>
            </div>

            <PlanDetailLevelSelection
              serviceType={state.serviceType!}
              onSelect={handleDetailLevelSelection}
              selectedLevel={state.planDetailLevel}
              onNext={handleGenerateOptions}
              isGenerating={state.isGenerating}
            />
          </>
        )

      case 'plan-selection':
        return (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">支援計画選択</h2>
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, currentStep: 'detail-level' }))}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                詳細度選択に戻る
              </Button>
            </div>

            <SupportPlanOptionsSelection
              options={state.supportPlanOptions}
              selectedOptions={state.selectedOptions}
              onSelectionChange={handleOptionsSelectionChange}
              onNext={handleCreatePDF}
              isGenerating={state.isGenerating}
            />
          </>
        )

      case 'plan-generation': {
        const selectedPlanOptions = state.supportPlanOptions.filter(option =>
          state.selectedOptions.includes(option.id)
        )

        return (
          <SelectedPlanPDFView
            selectedOptions={selectedPlanOptions}
            serviceType={state.serviceType!}
            interviewRecord={state.interviewRecord}
            onBack={handleBackToSelection}
            userAndFamilyIntentions={state.userAndFamilyIntentions || undefined}
            comprehensiveSupport={state.comprehensiveSupport || undefined}
          />
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
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

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            使用方法
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-800 space-y-2 mb-4">
            <p className="font-medium"><strong>個別支援計画書を作成する手順</strong></p>
          </div>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>事業区分を選択してください（A型・B型・生活介護）</li>
            <li>面談記録を入力してください</li>
            <li>プランの詳細度を選択してください（基本・詳細）</li>
            <li>生成された9つのオプションから選択してください</li>
            <li>選択した項目を編集して個別支援計画書を完成させてください</li>
          </ol>
        </CardContent>
      </Card>

      {renderCurrentStep()}

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
            AI処理にはGoogle Gemini APIを使用しており、送信されたデータはモデルの学習には使用されません。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
