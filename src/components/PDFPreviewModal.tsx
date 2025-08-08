'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { exportService } from '@/services/exportService'

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  fileName?: string;
  onOpenChange?: (isOpen: boolean) => void;
  pdfData?: {
    serviceType: string;
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
    selectedSections: string[];
  };
}

export default function PDFPreviewModal({
  isOpen,
  onClose,
  contentRef,
  fileName = '個別支援計画書',
  onOpenChange,
  pdfData
}: PDFPreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [error, setError] = useState<string | null>(null)

  const generatePreview = async () => {
    if (!isOpen || !pdfData) return

    setIsGenerating(true)
    setError(null)

    try {
      console.log('PDFプレビュー生成を開始...')
      // 優先: DOMプレビュー（html2canvas + jsPDF）
      if (contentRef?.current) {
        const pdfBlob = await exportService.previewElementAsPDF(contentRef.current, {
          scale: 3,
          backgroundColor: '#ffffff',
          marginMm: 5,
          fitToOnePage: true,
          orientation: 'landscape'
        })
        const url = URL.createObjectURL(pdfBlob)
        setPreviewUrl(url)
        console.log('PDFプレビュー生成完了（DOMキャプチャ）')
      } else {
        // フォールバック: 直接jsPDF生成（既存クラス）
        const { GovernmentStylePDFGenerator } = await import('@/lib/pdf-generator')
        const generator = new GovernmentStylePDFGenerator()
        const pdfBlob = await generator.generatePreviewBlob(pdfData)
        const url = URL.createObjectURL(pdfBlob)
        setPreviewUrl(url)
        console.log('PDFプレビュー生成完了（フォールバック）')
      }
    } catch (error) {
      console.error('PDF生成エラー:', error)
      setError('PDFの生成に失敗しました。もう一度お試しください。')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = async () => {
    if (!pdfData) return

    setIsGenerating(true)
    try {
      console.log('PDF出力を開始...')
      if (contentRef?.current) {
        await exportService.saveElementAsPDF(contentRef.current, {
          fileName,
          scale: 3,
          backgroundColor: '#ffffff',
          marginMm: 5,
          fitToOnePage: true,
          orientation: 'landscape'
        })
        console.log('PDF出力完了（DOMキャプチャ）')
      } else {
        const { GovernmentStylePDFGenerator } = await import('@/lib/pdf-generator')
        const generator = new GovernmentStylePDFGenerator()
        await generator.downloadPDF(pdfData, fileName)
        console.log('PDF出力完了（フォールバック）')
      }
    } catch (error) {
      console.error('PDF出力エラー:', error)
      setError('PDFの出力に失敗しました。')
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      onOpenChange?.(true)
      generatePreview()
    } else {
      onOpenChange?.(false)
      // モーダルが閉じられたらURLをクリーンアップ
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [isOpen, pdfData])

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50))
  const handleZoomReset = () => setZoom(100)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">PDFプレビュー</h2>
          <div className="flex items-center gap-2">
            {/* ズームコントロール */}
            <div className="flex items-center gap-1 border rounded">
              <Button size="sm" variant="ghost" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="px-2 py-1 text-sm border-x min-w-[60px] text-center">
                {zoom}%
              </span>
              <Button size="sm" variant="ghost" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleZoomReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              onClick={downloadPDF}
              disabled={isGenerating || !previewUrl}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              ダウンロード
            </Button>
            
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">PDFを生成中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <p className="mb-4">{error}</p>
                <Button onClick={generatePreview} variant="outline">
                  再試行
                </Button>
              </div>
            </div>
          ) : previewUrl ? (
            <div 
              className="mx-auto bg-white shadow-lg"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease'
              }}
            >
              <iframe
                src={previewUrl}
                className="w-full h-[800px] border-0"
                title="PDF Preview"
              />
            </div>
          ) : null}
        </div>

        {/* フッター */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            jsPDF直接生成による高品質なPDFプレビューです。ダウンロードしてご確認ください。
          </p>
        </div>
      </div>
    </div>
  )
}