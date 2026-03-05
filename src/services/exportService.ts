// 画面コンテンツをPDF/画像としてエクスポートするサービス
// - DOM → PDF: html2canvas + jsPDF
// - ライブラリ用語補足: html2canvas はDOMをCanvas化、jsPDF はPDF生成

import { generatePDFFromElement, generatePDFFromText, generatePDFFromTable, generatePreviewFromElement } from './pdfExportService'

export const exportService = {
  /**
   * 任意のDOM要素をPDF保存
   */
  saveElementAsPDF: generatePDFFromElement,

  /**
   * 任意のDOM要素からPDFプレビュー用Blobを生成
   */
  previewElementAsPDF: generatePreviewFromElement,

  /**
   * テキストをPDF保存
   */
  saveTextAsPDF: generatePDFFromText,

  /**
   * 表データをPDF保存
   */
  saveTableAsPDF: generatePDFFromTable
}

export type ExportService = typeof exportService


