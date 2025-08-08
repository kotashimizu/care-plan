'use client'

import { useState, useRef } from 'react'
import { SupportPlanOption, ServiceType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import PDFPreviewModal from './PDFPreviewModal'
import PlanEditorForm from './PlanEditorForm'

interface SelectedPlanPDFViewProps {
  selectedOptions: SupportPlanOption[];
  serviceType: ServiceType;
  interviewRecord: string;
  onBack: () => void;
  // onEdit?: (optionId: string, newContent: string) => void;
  userAndFamilyIntentions?: string;
  comprehensiveSupport?: string;
}

export default function SelectedPlanPDFView({
  selectedOptions,
  serviceType,
  interviewRecord,
  onBack,
  // onEdit,
  userAndFamilyIntentions,
  comprehensiveSupport
}: SelectedPlanPDFViewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  // const [isPDFMode, setIsPDFMode] = useState(false) // 現在未使用
  const contentRef = useRef<HTMLDivElement>(null)
  const [structuredPlanState, setStructuredPlanState] = useState<{
    userAndFamilyIntentions: string;
    comprehensiveSupport: string;
    longTermGoal: string;
    shortTermGoal: string;
    supportGoals: Record<string, {
      itemName: string;
      objective: string;
      supportContent: string;
      achievementPeriod: string;
      provider: string;
      userRole: string;
      priority: string;
    }>;
  } | null>(null)
  
  const [userInfo, setUserInfo] = useState({
    userName: '',
    createdYear: new Date().getFullYear().toString(),
    createdMonth: (new Date().getMonth() + 1).toString(),
    createdDay: new Date().getDate().toString(),
    serviceManagerName: ''
  })

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

  const handlePDFDownload = () => setIsPreviewOpen(true)
  const handlePreview = () => setIsPreviewOpen(true)

  const categorizedOptions = {
    A: selectedOptions.filter(opt => opt.category === 'A'),
    B: selectedOptions.filter(opt => opt.category === 'B'),
    C: selectedOptions.filter(opt => opt.category === 'C')
  }

  // const categoryTitles = {
  //   A: '就労・作業に関する支援',
  //   B: '日常生活・健康に関する支援',
  //   C: '社会参加・人間関係に関する支援'
  // }

  // 厚生労働省準拠の形式でデータを構造化
  const generateStructuredPlan = () => {
    // 選択されたオプションから構造化データを生成
    const employmentOptions = categorizedOptions.A || []
    const dailyLifeOptions = categorizedOptions.B || []
    const socialOptions = categorizedOptions.C || []

    // AIを活用して意向を生成するための準備
    // const generateIntentionsPrompt = () => {
    //   // この関数は実際にはAI APIを呼び出すべきですが、
    //   // 現在は簡易的な実装として、より自然な文章を生成します
    //   return '面談記録と選択された支援内容を基に、利用者とご家族の意向を適切に要約してください。'
    // }
    
    // 面談記録から意向を生成（AIから取得した内容を優先）
    const extractIntentions = (record: string) => {
      // AI生成の意向があればそれを使用
      if (userAndFamilyIntentions) {
        return userAndFamilyIntentions
      }
      
      // なければデフォルト
      if (!record || record.trim().length === 0) {
        return '（面談時に聴取した内容を記載）'
      }
      
      return '就労に向けた準備を進めながら、生活リズムの安定と社会性の向上を図りたいと考えている。家族も本人の成長を見守りながら、段階的な自立を応援したいと話されている'
    }

    // 支援方針を生成（AI生成内容を優先）
    const generateComprehensiveSupport = () => {
      // AI生成の支援方針があればそれを使用
      if (comprehensiveSupport) {
        return comprehensiveSupport
      }
      
      // なければデフォルトの生成ロジック
      const serviceTypeName = getServiceTypeName(serviceType)
      const allOptions = [...employmentOptions, ...dailyLifeOptions, ...socialOptions]
      
      const supportPillars = []
      if (employmentOptions.length > 0) {
        supportPillars.push('作業能力の段階的向上')
      }
      if (dailyLifeOptions.length > 0) {
        supportPillars.push('生活リズムの確立')
      }
      if (socialOptions.length > 0) {
        supportPillars.push('コミュニケーション能力の向上')
      }
      
      const pillarsText = supportPillars.join('、')
      const approach = allOptions.length >= 6 ? '多角的なアプローチにより' : 'スモールステップの原則に基づき'
      const evaluation = '定期的なモニタリング（3ヶ月ごと）と中間評価（6ヶ月）を実施し、必要に応じて支援内容を見直す'
      
      return `${serviceTypeName}の特性を活かし、${pillarsText}を重点目標として設定。${approach}、利用者の強みを活かしながら課題の改善を図る。${evaluation}`
    }

    // 目標を生成
    const generateGoals = () => {
      const hasEmployment = employmentOptions.length > 0
      const hasDailyLife = dailyLifeOptions.length > 0
      const hasSocial = socialOptions.length > 0
      
      let longTermGoal = ''
      let shortTermGoal = ''
      
      if (hasEmployment) {
        longTermGoal += '就労スキルの向上と安定した作業遂行、'
        shortTermGoal += '基本的な作業手順の習得、'
      }
      
      if (hasDailyLife) {
        longTermGoal += '日常生活の自立度向上、'
        shortTermGoal += '生活リズムの安定、'
      }
      
      if (hasSocial) {
        longTermGoal += '社会参加の機会拡大と対人関係の向上'
        shortTermGoal += '集団活動への積極的参加'
      }
      
      longTermGoal = longTermGoal.replace(/、$/, '') + 'を目指す'
      shortTermGoal = shortTermGoal.replace(/、$/, '') + 'に取り組む'
      
      return { longTermGoal, shortTermGoal }
    }

    const { longTermGoal, shortTermGoal } = generateGoals()

    return {
      userAndFamilyIntentions: extractIntentions(interviewRecord),
      comprehensiveSupport: generateComprehensiveSupport(),
      longTermGoal,
      shortTermGoal,
      supportGoals: {
        employment: {
          itemName: employmentOptions[0]?.title || '就労・作業支援',
          objective: employmentOptions.length > 0 
            ? employmentOptions[0].content.split('。')[0] 
            : '作業能力の向上と就労意欲の維持',
          supportContent: employmentOptions.length > 1
            ? employmentOptions.slice(1).map(opt => opt.content.split('。')[0]).join('。')
            : '段階的な作業訓練と個別指導の実施',
          achievementPeriod: '6ヶ月',
          provider: 'サービス管理責任者・職業指導員',
          userRole: '指導内容の実践と振り返りへの参加',
          priority: '高'
        },
        dailyLife: {
          itemName: dailyLifeOptions[0]?.title || '生活支援',
          objective: dailyLifeOptions.length > 0
            ? dailyLifeOptions[0].content.split('。')[0]
            : '基本的生活習慣の確立',
          supportContent: dailyLifeOptions.length > 1
            ? dailyLifeOptions.slice(1).map(opt => opt.content.split('。')[0]).join('。')
            : '個別の生活課題に応じた支援の実施',
          achievementPeriod: '3ヶ月',
          provider: '生活支援員',
          userRole: '支援計画に基づく実践と報告',
          priority: '中'
        },
        socialLife: {
          itemName: socialOptions[0]?.title || '社会生活支援',
          objective: socialOptions.length > 0
            ? socialOptions[0].content.split('。')[0]
            : 'コミュニケーション能力の向上',
          supportContent: socialOptions.length > 1
            ? socialOptions.slice(1).map(opt => opt.content.split('。')[0]).join('。')
            : '集団活動への参加機会の提供と個別支援',
          achievementPeriod: '6ヶ月',
          provider: '職員全体',
          userRole: '活動への参加と他者との関わり',
          priority: '中'
        }
      }
    }
  }

  const basePlan = generateStructuredPlan()
  const structuredPlan = structuredPlanState || basePlan

  return (
    <div className="space-y-6">
      {/* コントロールバー */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          選択画面に戻る
        </Button>
      </div>

      {/* 新UI: 編集フォーム */}
      <PlanEditorForm
        value={structuredPlan}
        onChange={(next) => setStructuredPlanState(next)}
        onPreview={handlePreview}
        onSavePdf={handlePDFDownload}
        userInfo={userInfo}
        onUserInfoChange={setUserInfo}
      />

      {/* 行政書類形式のPDFレイアウト（プレビュー/出力用の画面外DOM） */}
      <div
        ref={contentRef}
        className="bg-white absolute -left-[10000px] top-0 pointer-events-none"
        style={{
          width: '297mm',
          minHeight: '210mm',
          fontFamily: '"MS Gothic", "MS UI Gothic", monospace',
          fontSize: '10px',
          lineHeight: '1.3',
          padding: '10mm 15mm'
        }}
      >
        {/* 文書ヘッダー */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '11px' }}>利用者氏名：</span>
              <span style={{ 
                display: 'inline-block',
                minWidth: '200px',
                marginLeft: '10px',
                fontSize: '11px',
                paddingBottom: '2px'
              }}>{userInfo.userName || '　'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', marginRight: '10px' }}>作成年月日：</span>
              <span style={{ fontSize: '11px' }}>
                {userInfo.createdYear || '　　'}年
                {userInfo.createdMonth || '　　'}月
                {userInfo.createdDay || '　　'}日
              </span>
            </div>
          </div>
          <h1 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            textAlign: 'center',
            marginTop: '10px'
          }}>
            個別支援計画書
          </h1>
        </div>

        {/* 基本情報テーブル */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          border: '2px solid #000',
          marginBottom: '20px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ 
                border: '1px solid #000', 
                padding: '8px', 
                fontSize: '12px', 
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                項目
              </th>
              <th style={{ 
                border: '1px solid #000', 
                padding: '8px', 
                fontSize: '12px', 
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                内容
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ 
                border: '1px solid #000', 
                padding: '8px',
                fontWeight: 'bold',
                backgroundColor: '#f8f8f8',
                width: '25%',
                verticalAlign: 'top'
              }}>
                ご本人・ご家族の意向
              </td>
              <td style={{ 
                border: '1px solid #000', 
                padding: '8px',
                verticalAlign: 'top'
              }}>
                <div>{structuredPlan.userAndFamilyIntentions}</div>
              </td>
            </tr>
            
            <tr>
              <td style={{ 
                border: '1px solid #000', 
                padding: '8px',
                fontWeight: 'bold',
                backgroundColor: '#f8f8f8',
                verticalAlign: 'top'
              }}>
                総合的な支援の方針
              </td>
              <td style={{ 
                border: '1px solid #000', 
                padding: '8px',
                verticalAlign: 'top'
              }}>
                <div>{structuredPlan.comprehensiveSupport}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 目標テーブル */}
        {true && (
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            border: '2px solid #000',
            marginBottom: '20px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ 
                  border: '1px solid #000', 
                  padding: '8px', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '25%'
                }}>
                  目標区分
                </th>
                <th style={{ 
                  border: '1px solid #000', 
                  padding: '8px', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  目標内容
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ 
                  border: '1px solid #000', 
                  padding: '8px',
                  fontWeight: 'bold',
                  backgroundColor: '#f8f8f8',
                  textAlign: 'center'
                }}>
                  長期目標<br />（1年）
                </td>
                <td style={{ 
                  border: '1px solid #000', 
                  padding: '8px'
                }}>
                  {structuredPlan.longTermGoal}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  border: '1px solid #000', 
                  padding: '8px',
                  fontWeight: 'bold',
                  backgroundColor: '#f8f8f8',
                  textAlign: 'center'
                }}>
                  短期目標<br />（3ヶ月）
                </td>
                <td style={{ 
                  border: '1px solid #000', 
                  padding: '8px'
                }}>
                  {structuredPlan.shortTermGoal}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* 支援目標詳細テーブル */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          border: '2px solid #000',
          marginBottom: '20px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ 
                border: '1px solid #000', 
                padding: '6px', 
                fontSize: '10px', 
                fontWeight: 'bold',
                textAlign: 'center',
                width: '10%'
              }}>
                支援領域
              </th>
              <th style={{ 
                border: '1px solid #000', 
                padding: '6px', 
                fontSize: '10px', 
                fontWeight: 'bold',
                textAlign: 'center',
                width: '20%'
              }}>
                支援目標
              </th>
              <th style={{ 
                border: '1px solid #000', 
                padding: '6px', 
                fontSize: '10px', 
                fontWeight: 'bold',
                textAlign: 'center',
                width: '30%'
              }}>
                支援内容
              </th>
              <th style={{ 
                border: '1px solid #000', 
                padding: '6px', 
                fontSize: '10px', 
                fontWeight: 'bold',
                textAlign: 'center',
                width: '8%'
              }}>
                達成時期
              </th>
              <th style={{ 
                border: '1px solid #000', 
                padding: '6px', 
                fontSize: '10px', 
                fontWeight: 'bold',
                textAlign: 'center',
                width: '10%'
              }}>
                担当者
              </th>
              <th style={{ 
                border: '1px solid #000', 
                padding: '6px', 
                fontSize: '10px', 
                fontWeight: 'bold',
                textAlign: 'center',
                width: '5%'
              }}>
                優先度
              </th>
              <th style={{ 
                border: '1px solid #000', 
                padding: '6px', 
                fontSize: '10px', 
                fontWeight: 'bold',
                textAlign: 'center',
                width: '15%'
              }}>
                留意事項<br />（本人の役割を含む）
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(structuredPlan.supportGoals).map(([key, goal]) => {
              return (
                <tr key={key}>
                  <td style={{ 
                    border: '1px solid #000', 
                    padding: '6px',
                    fontWeight: 'bold',
                    backgroundColor: '#f8f8f8',
                    textAlign: 'center',
                    verticalAlign: 'middle'
                  }}>
                    {goal.itemName}
                  </td>
                  <td style={{ 
                    border: '1px solid #000', 
                    padding: '6px',
                    fontSize: '10px',
                    verticalAlign: 'top'
                  }}>
                    <div>{goal.objective}</div>
                  </td>
                  <td style={{ 
                    border: '1px solid #000', 
                    padding: '6px',
                    fontSize: '10px',
                    verticalAlign: 'top'
                  }}>
                    <div>{goal.supportContent}</div>
                  </td>
                  <td style={{ 
                    border: '1px solid #000', 
                    padding: '6px',
                    fontSize: '10px',
                    textAlign: 'center',
                    verticalAlign: 'middle'
                  }}>
                    {goal.achievementPeriod}
                  </td>
                  <td style={{ 
                    border: '1px solid #000', 
                    padding: '6px',
                    fontSize: '9px',
                    textAlign: 'center',
                    verticalAlign: 'middle'
                  }}>
                    {goal.provider}
                  </td>
                  <td style={{ 
                    border: '1px solid #000', 
                    padding: '6px',
                    fontSize: '10px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    fontWeight: 'bold'
                  }}>
                    {goal.priority}
                  </td>
                  <td style={{ 
                    border: '1px solid #000', 
                    padding: '6px',
                    fontSize: '9px',
                    verticalAlign: 'top'
                  }}>
                    {goal.userRole}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* 署名欄 */}
        <div style={{ marginTop: '40px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* 左側：サービス管理責任者 */}
            <div style={{ width: '48%' }}>
              <p style={{ fontSize: '11px', marginBottom: '25px' }}>
                提供するサービス内容について、本計画書に基づき説明しました。
              </p>
              <div>
                <span style={{ fontSize: '11px', display: 'inline' }}>サービス管理責任者氏名：</span>
                <span style={{ 
                  display: 'inline-block', 
                  minWidth: '200px', 
                  marginLeft: '10px',
                  fontSize: '11px'
                }}>{userInfo.serviceManagerName || '　'}</span>
              </div>
            </div>
            
            {/* 右側：利用者署名 */}
            <div style={{ width: '48%', textAlign: 'right' }}>
              <p style={{ fontSize: '11px', marginBottom: '25px', textAlign: 'left' }}>
                本計画書に基づきサービスの提供を受け、内容に同意しました。
              </p>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', marginRight: '20px' }}>年　　月　　日（利用者署名）</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* PDFプレビューモーダル */}
      <PDFPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        contentRef={contentRef}
        fileName="個別支援計画書"
        onOpenChange={() => {}}
        pdfData={{
          serviceType: getServiceTypeName(serviceType),
          userAndFamilyIntentions: structuredPlan.userAndFamilyIntentions,
          comprehensiveSupport: structuredPlan.comprehensiveSupport,
          longTermGoal: structuredPlan.longTermGoal,
          shortTermGoal: structuredPlan.shortTermGoal,
          supportGoals: structuredPlan.supportGoals,
          selectedSections: ['header','intentions','comprehensive','goals','employment','dailyLife','socialLife']
        }}
      />
    </div>
  )
}