// 月次レポートPDF生成サービス（テキスト中心）
// 専門用語補足: jsPDF はPDFをプログラムで生成するライブラリです

import jsPDF from 'jspdf'

export interface MonthlyReportSection {
  title: string
  content: string
}

export interface MonthlyReportData {
  reportTitle: string
  month: string // 例: 2025-08
  facilityName?: string
  author?: string
  sections: MonthlyReportSection[]
}

export interface ReportOptions {
  fileName?: string
  marginMm?: number
  fontSize?: number
  lineHeight?: number
  orientation?: 'portrait' | 'landscape'
  returnBlob?: boolean
}

export async function generateMonthlyReportPDF(
  data: MonthlyReportData,
  options: ReportOptions = {}
): Promise<Blob | void> {
  const {
    fileName = 'monthly_report',
    marginMm = 18,
    fontSize = 12,
    lineHeight = 6,
    orientation = 'portrait',
    returnBlob = false
  } = options

  const pageWidthMm = orientation === 'portrait' ? 210 : 297
  const pageHeightMm = orientation === 'portrait' ? 297 : 210
  const usableWidth = pageWidthMm - marginMm * 2

  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' })
  doc.setFont('helvetica', 'normal')

  // タイトル
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(data.reportTitle, marginMm, marginMm)

  // メタ情報
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const metaLines = [
    `対象月: ${data.month}`,
    data.facilityName ? `事業所: ${data.facilityName}` : undefined,
    data.author ? `作成者: ${data.author}` : undefined
  ].filter(Boolean) as string[]

  let cursorY = marginMm + 8
  metaLines.forEach((line) => {
    doc.text(line, marginMm, cursorY)
    cursorY += 5
  })

  // セクション本文
  doc.setFontSize(fontSize)
  data.sections.forEach((section, index) => {
    // ページ繰り上げ余白
    if (cursorY + 14 > pageHeightMm - marginMm) {
      doc.addPage()
      cursorY = marginMm
    }

    // 見出し
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${section.title}`, marginMm, cursorY)
    cursorY += 7

    // 本文（折返し）
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(section.content, usableWidth)
    lines.forEach((line: string) => {
      if (cursorY + lineHeight > pageHeightMm - marginMm) {
        doc.addPage()
        cursorY = marginMm
      }
      doc.text(line, marginMm, cursorY)
      cursorY += lineHeight
    })
    cursorY += 4
  })

  if (returnBlob) {
    return doc.output('blob')
  }
  const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')
  doc.save(`${fileName}_${date}.pdf`)
}

export async function generateMonthlyReportPreview(
  data: MonthlyReportData,
  options: Omit<ReportOptions, 'returnBlob' | 'fileName'> = {}
): Promise<Blob> {
  const blob = await generateMonthlyReportPDF(data, { ...options, returnBlob: true })
  if (!(blob instanceof Blob)) {
    throw new Error('Failed to generate monthly report preview blob')
  }
  return blob
}


