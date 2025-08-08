// jsPDF + html2canvas を使ったPDF生成サービス
// - DOM要素を画像化してPDF化（プレビュー/ダウンロード）
// - 素朴なテキスト描画
// - 簡易テーブル描画（jspdf-autotableを利用）

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
// @ts-ignore: 型定義がデフォルトエクスポートに対応していない場合があるため抑制
import autoTable from 'jspdf-autotable'

export type PDFOrientation = 'portrait' | 'landscape'

export interface GenerateFromElementOptions {
  fileName?: string
  orientation?: PDFOrientation
  /** html2canvas のスケール（数値が大きいほど高解像度） */
  scale?: number
  /** true の場合は保存せず Blob を返す（プレビュー用） */
  returnBlob?: boolean
  /** 余白（mm） */
  marginMm?: number
  /** 背景色（キャンバス作成時） */
  backgroundColor?: string
  /** 1ページに収める（画像を縮小して単ページにフィットさせる） */
  fitToOnePage?: boolean
}

/**
 * DOM要素をそのままPDF化します（html2canvas → 画像 → jsPDF）
 * - 用語補足: html2canvas はDOMをキャンバス画像に変換するライブラリです
 * - 用語補足: jsPDF はPDFを書き出すライブラリです
 */
export async function generatePDFFromElement(
  element: HTMLElement,
  options: GenerateFromElementOptions = {}
): Promise<Blob | void> {
  const {
    fileName = 'document',
    orientation = 'landscape',
    scale = 2,
    returnBlob = false,
    marginMm = 5,
    backgroundColor = '#ffffff',
    fitToOnePage = false
  } = options

  // A4サイズのmm
  const pageWidthMm = orientation === 'portrait' ? 210 : 297
  const pageHeightMm = orientation === 'portrait' ? 297 : 210

  // DOM → Canvas へ変換
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor
  })

  // Canvas を画像データURLへ
  const imgData = canvas.toDataURL('image/png')

  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' })

  // 画像サイズ（mm）算出
  const drawableWidthMm = pageWidthMm - marginMm * 2
  const drawableHeightMm = pageHeightMm - marginMm * 2
  let imgWidthMm = drawableWidthMm
  let imgHeightMm = (canvas.height * imgWidthMm) / canvas.width

  if (fitToOnePage) {
    // 単ページに収めるために縮小率を計算
    if (imgHeightMm > drawableHeightMm) {
      const scaleToFit = drawableHeightMm / imgHeightMm
      imgWidthMm = imgWidthMm * scaleToFit
      imgHeightMm = imgHeightMm * scaleToFit
    }
    const x = marginMm + (drawableWidthMm - imgWidthMm) / 2
    const y = marginMm + (drawableHeightMm - imgHeightMm) / 2
    doc.addImage(imgData, 'PNG', x, y, imgWidthMm, imgHeightMm)
  } else {
    // 通常: 必要に応じて複数ページ
    let heightLeft = imgHeightMm
    let position = marginMm
    doc.addImage(imgData, 'PNG', marginMm, position, imgWidthMm, imgHeightMm)
    heightLeft -= drawableHeightMm
    while (heightLeft > 0) {
      doc.addPage()
      position = marginMm - (imgHeightMm - heightLeft)
      doc.addImage(imgData, 'PNG', marginMm, position, imgWidthMm, imgHeightMm)
      heightLeft -= drawableHeightMm
    }
  }

  if (returnBlob) {
    return doc.output('blob')
  }
  const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')
  doc.save(`${fileName}_${date}.pdf`)
}

export interface GenerateFromTextOptions {
  fileName?: string
  marginMm?: number
  fontSize?: number
  lineHeight?: number
  orientation?: PDFOrientation
  /** テキスト領域の最大幅（mm）。未指定なら左右マージンから自動計算 */
  maxWidthMm?: number
  /** 保存せず Blob を返すか */
  returnBlob?: boolean
}

/**
 * テキストをPDFへ描画（長文は splitTextToSize で折返し）
 */
export async function generatePDFFromText(
  content: string,
  options: GenerateFromTextOptions = {}
): Promise<Blob | void> {
  const {
    fileName = 'document',
    marginMm = 20,
    fontSize = 12,
    lineHeight = 6,
    orientation = 'portrait',
    maxWidthMm,
    returnBlob = false
  } = options

  const pageWidthMm = orientation === 'portrait' ? 210 : 297
  const pageHeightMm = orientation === 'portrait' ? 297 : 210

  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(fontSize)

  const usableWidth = (maxWidthMm ?? (pageWidthMm - marginMm * 2))
  const lines = doc.splitTextToSize(content, usableWidth)

  let cursorY = marginMm
  lines.forEach((line: string) => {
    if (cursorY + lineHeight > pageHeightMm - marginMm) {
      doc.addPage()
      cursorY = marginMm
    }
    doc.text(line, marginMm, cursorY)
    cursorY += lineHeight
  })

  if (returnBlob) {
    return doc.output('blob')
  }
  const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')
  doc.save(`${fileName}_${date}.pdf`)
}

export interface GenerateFromTableOptions {
  fileName?: string
  orientation?: PDFOrientation
  marginMm?: number
  returnBlob?: boolean
  /** autoTable のオプションを必要に応じて透過 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  autoTableOptions?: Record<string, any>
}

/**
 * 簡易的な表をPDFに描画
 * - 実装は jspdf-autotable に依存（手早く整った表を出力可能）
 * - 代替案: 自前で罫線/テキストを描画しても良い（柔軟だが工数高）
 */
export async function generatePDFFromTable(
  headers: string[],
  rows: Array<Array<string | number>>,
  options: GenerateFromTableOptions = {}
): Promise<Blob | void> {
  const { fileName = 'table', orientation = 'portrait', marginMm = 14, returnBlob = false, autoTableOptions = {} } = options

  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' })
  doc.setFont('helvetica', 'normal')

  // タイトル例（必要に応じて削除/変更）
  doc.setFontSize(14)
  doc.text('表データ', marginMm, marginMm)

  // @ts-ignore: autotable の型定義差異を吸収
  autoTable(doc, {
    startY: marginMm + 6,
    head: [headers],
    body: rows,
    styles: { fontSize: 10 },
    ...autoTableOptions
  })

  if (returnBlob) {
    return doc.output('blob')
  }
  const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')
  doc.save(`${fileName}_${date}.pdf`)
}

/**
 * プレビュー専用: DOMからBlobを返すヘルパー
 */
export async function generatePreviewFromElement(
  element: HTMLElement,
  options: Omit<GenerateFromElementOptions, 'returnBlob' | 'fileName'> = {}
): Promise<Blob> {
  const blob = await generatePDFFromElement(element, { ...options, returnBlob: true })
  if (!(blob instanceof Blob)) {
    throw new Error('Failed to generate preview blob from element')
  }
  return blob
}


