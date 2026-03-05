'use client'

import { useEffect, useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { Button } from '@/components/ui/button'
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { exportService } from '@/services/exportService'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

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
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [scale, setScale] = useState(1.0)
  const [numPages, setNumPages] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const generatePreview = useCallback(async () => {
    if (!isOpen || !pdfData) return

    setIsGenerating(true)
    setError(null)

    try {
      if (contentRef?.current) {
        const pdfBlob = await exportService.previewElementAsPDF(contentRef.current, {
          scale: 3,
          backgroundColor: '#ffffff',
          marginMm: 5,
          fitToOnePage: true,
          orientation: 'landscape'
        })
        const url = URL.createObjectURL(pdfBlob)
        setPdfBlobUrl(url)
      } else {
        const { GovernmentStylePDFGenerator } = await import('@/lib/pdf-generator')
        const generator = new GovernmentStylePDFGenerator()
        const pdfBlob = await generator.generatePreviewBlob(pdfData)
        const url = URL.createObjectURL(pdfBlob)
        setPdfBlobUrl(url)
      }
    } catch {
      setError('PDFの生成に失敗しました。もう一度お試しください。')
    } finally {
      setIsGenerating(false)
    }
  }, [isOpen, pdfData, contentRef])

  const downloadPDF = async () => {
    if (!pdfData) return

    setIsGenerating(true)
    try {
      if (contentRef?.current) {
        await exportService.saveElementAsPDF(contentRef.current, {
          fileName,
          scale: 3,
          backgroundColor: '#ffffff',
          marginMm: 5,
          fitToOnePage: true,
          orientation: 'landscape'
        })
      } else {
        const { GovernmentStylePDFGenerator } = await import('@/lib/pdf-generator')
        const generator = new GovernmentStylePDFGenerator()
        await generator.downloadPDF(pdfData, fileName)
      }
    } catch {
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
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl)
        setPdfBlobUrl(null)
      }
      setNumPages(0)
    }

    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pdfData])

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 2.5))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))
  const handleZoomReset = () => setScale(1.0)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">PDFプレビュー</h2>
            {numPages > 0 && (
              <span className="text-sm text-gray-500">{numPages}ページ</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* ズームコントロール */}
            <div className="flex items-center gap-1 border rounded">
              <Button size="sm" variant="ghost" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="px-2 py-1 text-sm border-x min-w-[60px] text-center">
                {Math.round(scale * 100)}%
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
              disabled={isGenerating || !pdfBlobUrl}
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
          ) : pdfBlobUrl ? (
            <div className="flex flex-col items-center gap-4">
              <Document
                file={pdfBlobUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={() => setError('PDFの読み込みに失敗しました。')}
                loading={
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                }
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div key={`page_${index + 1}`} className="mb-4 shadow-lg">
                    <Page
                      pageNumber={index + 1}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))}
              </Document>
            </div>
          ) : null}
        </div>

        {/* フッター */}
        <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            ダウンロードしてご確認ください
          </p>
          {numPages > 1 && (
            <p className="text-xs text-gray-500">
              全{numPages}ページ（スクロールで閲覧）
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
