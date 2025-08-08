import jsPDF from 'jspdf'
import { convertToLatinEquivalent, containsJapanese, addJapaneseFontSupport } from './japanese-font'

export interface PDFSupportGoal {
  itemName: string
  objective: string
  supportContent: string
  achievementPeriod: string
  provider: string
  userRole: string
  priority: string
}

export interface PDFPlanData {
  serviceType: string
  userAndFamilyIntentions: string
  comprehensiveSupport: string
  longTermGoal: string
  shortTermGoal: string
  supportGoals: Record<string, PDFSupportGoal>
  selectedSections: string[]
}

export class GovernmentStylePDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private currentY: number
  private fontReady: boolean = false

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 20
    this.currentY = this.margin

    // 初期フォント設定
    this.doc.setFont('helvetica', 'normal')
  }

  private async setupJapaneseFont(): Promise<void> {
    if (this.fontReady) return

    try {
      console.log('PDF生成: フォント設定を開始')
      const success = await addJapaneseFontSupport(this.doc)
      
      if (success) {
        this.fontReady = true
        console.log('PDF生成: フォント設定完了')
      } else {
        console.warn('PDF生成: 標準フォントを使用します')
        this.doc.setFont('helvetica', 'normal')
        this.fontReady = true // 標準フォントでも準備完了とする
      }
    } catch (error) {
      console.error('PDF生成: フォント設定エラー:', error)
      this.doc.setFont('helvetica', 'normal')
      this.fontReady = true // エラー時も準備完了とする
    }
  }

  private addText(text: string, x: number, y: number, options: {
    fontSize?: number
    fontStyle?: 'normal' | 'bold'
    align?: 'left' | 'center' | 'right'
    maxWidth?: number
  } = {}) {
    const { fontSize = 10, fontStyle = 'normal', align = 'left', maxWidth } = options
    
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', fontStyle)
    
    // 日本語テキストの処理（常にLatin変換を使用）
    const processedText = this.processJapaneseText(text)
    
    if (maxWidth) {
      try {
        const lines = this.doc.splitTextToSize(processedText, maxWidth)
        lines.forEach((line: string, index: number) => {
          if (line && line.trim()) {
            this.doc.text(line, x, y + (index * (fontSize * 0.35)), { align })
          }
        })
        return lines.length * (fontSize * 0.35)
      } catch (error) {
        console.warn('テキスト分割エラー:', error)
        // フォールバック: 分割せずに表示
        this.doc.text(processedText, x, y, { align })
        return fontSize * 0.35
      }
    } else {
      try {
        this.doc.text(processedText, x, y, { align })
        return fontSize * 0.35
      } catch (error) {
        console.warn('テキスト表示エラー:', error)
        // フォールバック: エラー時は何も表示しない
        return fontSize * 0.35
      }
    }
  }

  private processJapaneseText(text: string): string {
    if (!text) return ''
    
    // 日本語テキストの前処理
    const processedText = text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // ゼロ幅文字を削除
      .replace(/\s+/g, ' ') // 複数のスペースを単一スペースに  
      .replace(/\u00A0/g, ' ') // ノーブレークスペースを通常スペースに
      .normalize('NFC') // Unicode正規化
      .trim()
    
    // 日本語文字が含まれている場合はラテン文字に変換
    if (containsJapanese(processedText)) {
      const latinText = convertToLatinEquivalent(processedText)
      console.log(`日本語文字を変換: "${processedText}" -> "${latinText}"`)
      return latinText
    }
    
    return processedText
  }

  private drawBorder(x: number, y: number, width: number, height: number, lineWidth: number = 0.5) {
    this.doc.setLineWidth(lineWidth)
    this.doc.rect(x, y, width, height)
  }

  private addHeader(data: PDFPlanData) {
    if (!data.selectedSections.includes('header')) return

    // タイトル
    this.addText('個別支援計画書', this.pageWidth / 2, this.currentY + 10, {
      fontSize: 16,
      fontStyle: 'bold',
      align: 'center'
    })

    // 下線
    const titleY = this.currentY + 12
    this.doc.setLineWidth(2)
    this.doc.line(this.margin + 40, titleY, this.pageWidth - this.margin - 40, titleY)

    this.currentY += 20

    // サービス種別
    this.addText(`サービス種別：${data.serviceType}`, this.pageWidth / 2, this.currentY, {
      fontSize: 12,
      align: 'center'
    })

    this.currentY += 10

    // 作成日・計画期間
    const today = new Date().toLocaleDateString('ja-JP')
    this.addText(`計画作成日：${today} | 計画期間：6ヶ月`, this.pageWidth / 2, this.currentY, {
      fontSize: 10,
      align: 'center'
    })

    this.currentY += 20
  }

  private addBasicInfoTable(data: PDFPlanData) {
    const tableX = this.margin
    const tableWidth = this.pageWidth - (2 * this.margin)
    const rowHeight = 20
    const headerHeight = 12

    // テーブルヘッダー
    this.doc.setFillColor(240, 240, 240)
    this.drawBorder(tableX, this.currentY, tableWidth, headerHeight, 2)
    this.doc.rect(tableX, this.currentY, tableWidth, headerHeight, 'F')

    // ヘッダーテキスト
    this.addText('項目', tableX + 2, this.currentY + 8, {
      fontSize: 12,
      fontStyle: 'bold'
    })
    this.addText('内容', tableX + (tableWidth * 0.25) + 2, this.currentY + 8, {
      fontSize: 12,
      fontStyle: 'bold'
    })

    // ヘッダー内の縦線
    this.doc.line(tableX + (tableWidth * 0.25), this.currentY, tableX + (tableWidth * 0.25), this.currentY + headerHeight)

    this.currentY += headerHeight

    // 意向の行
    if (data.selectedSections.includes('intentions')) {
      const intentionHeight = Math.max(rowHeight, this.calculateTextHeight(data.userAndFamilyIntentions, tableWidth * 0.7, 11) + 8)
      
      this.drawBorder(tableX, this.currentY, tableWidth, intentionHeight, 1)
      
      // セル背景
      this.doc.setFillColor(248, 248, 248)
      this.doc.rect(tableX, this.currentY, tableWidth * 0.25, intentionHeight, 'F')
      
      // 項目名
      this.addText('ご本人・ご家族の意向', tableX + 2, this.currentY + 8, {
        fontSize: 11,
        fontStyle: 'bold'
      })
      
      // 内容
      this.addText(data.userAndFamilyIntentions, tableX + (tableWidth * 0.25) + 2, this.currentY + 8, {
        fontSize: 11,
        maxWidth: tableWidth * 0.7
      })

      // 縦線
      this.doc.line(tableX + (tableWidth * 0.25), this.currentY, tableX + (tableWidth * 0.25), this.currentY + intentionHeight)

      this.currentY += intentionHeight
    }

    // 支援方針の行
    if (data.selectedSections.includes('comprehensive')) {
      const policyHeight = Math.max(rowHeight, this.calculateTextHeight(data.comprehensiveSupport, tableWidth * 0.7, 11) + 8)
      
      this.drawBorder(tableX, this.currentY, tableWidth, policyHeight, 1)
      
      // セル背景
      this.doc.setFillColor(248, 248, 248)
      this.doc.rect(tableX, this.currentY, tableWidth * 0.25, policyHeight, 'F')
      
      // 項目名
      this.addText('総合的な支援の方針', tableX + 2, this.currentY + 8, {
        fontSize: 11,
        fontStyle: 'bold'
      })
      
      // 内容
      this.addText(data.comprehensiveSupport, tableX + (tableWidth * 0.25) + 2, this.currentY + 8, {
        fontSize: 11,
        maxWidth: tableWidth * 0.7
      })

      // 縦線
      this.doc.line(tableX + (tableWidth * 0.25), this.currentY, tableX + (tableWidth * 0.25), this.currentY + policyHeight)

      this.currentY += policyHeight
    }

    this.currentY += 10
  }

  private addGoalsTable(data: PDFPlanData) {
    if (!data.selectedSections.includes('goals')) return

    const tableX = this.margin
    const tableWidth = this.pageWidth - (2 * this.margin)
    const headerHeight = 12

    // テーブルヘッダー
    this.doc.setFillColor(240, 240, 240)
    this.drawBorder(tableX, this.currentY, tableWidth, headerHeight, 2)
    this.doc.rect(tableX, this.currentY, tableWidth, headerHeight, 'F')

    // ヘッダーテキスト
    this.addText('目標区分', tableX + 2, this.currentY + 8, {
      fontSize: 12,
      fontStyle: 'bold'
    })
    this.addText('目標内容', tableX + (tableWidth * 0.25) + 2, this.currentY + 8, {
      fontSize: 12,
      fontStyle: 'bold'
    })

    // ヘッダー内の縦線
    this.doc.line(tableX + (tableWidth * 0.25), this.currentY, tableX + (tableWidth * 0.25), this.currentY + headerHeight)

    this.currentY += headerHeight

    // 長期目標
    const longGoalHeight = Math.max(25, this.calculateTextHeight(data.longTermGoal, tableWidth * 0.7, 11) + 8)
    this.drawBorder(tableX, this.currentY, tableWidth, longGoalHeight, 1)
    this.doc.setFillColor(248, 248, 248)
    this.doc.rect(tableX, this.currentY, tableWidth * 0.25, longGoalHeight, 'F')
    
    this.addText('長期目標\n(1年)', tableX + 2, this.currentY + 8, {
      fontSize: 11,
      fontStyle: 'bold'
    })
    this.addText(data.longTermGoal, tableX + (tableWidth * 0.25) + 2, this.currentY + 8, {
      fontSize: 11,
      maxWidth: tableWidth * 0.7
    })

    this.doc.line(tableX + (tableWidth * 0.25), this.currentY, tableX + (tableWidth * 0.25), this.currentY + longGoalHeight)
    this.currentY += longGoalHeight

    // 短期目標
    const shortGoalHeight = Math.max(25, this.calculateTextHeight(data.shortTermGoal, tableWidth * 0.7, 11) + 8)
    this.drawBorder(tableX, this.currentY, tableWidth, shortGoalHeight, 1)
    this.doc.setFillColor(248, 248, 248)
    this.doc.rect(tableX, this.currentY, tableWidth * 0.25, shortGoalHeight, 'F')
    
    this.addText('短期目標\n(3ヶ月)', tableX + 2, this.currentY + 8, {
      fontSize: 11,
      fontStyle: 'bold'
    })
    this.addText(data.shortTermGoal, tableX + (tableWidth * 0.25) + 2, this.currentY + 8, {
      fontSize: 11,
      maxWidth: tableWidth * 0.7
    })

    this.doc.line(tableX + (tableWidth * 0.25), this.currentY, tableX + (tableWidth * 0.25), this.currentY + shortGoalHeight)
    this.currentY += shortGoalHeight + 10
  }

  private addSupportGoalsTable(data: PDFPlanData) {
    const tableX = this.margin
    const tableWidth = this.pageWidth - (2 * this.margin)
    const headerHeight = 15

    // カラム幅の定義
    const colWidths = [
      tableWidth * 0.15, // 支援領域
      tableWidth * 0.25, // 支援目標
      tableWidth * 0.30, // 支援内容
      tableWidth * 0.10, // 達成時期
      tableWidth * 0.12, // 担当者
      tableWidth * 0.08  // 優先度
    ]

    // テーブルヘッダー
    this.doc.setFillColor(240, 240, 240)
    this.drawBorder(tableX, this.currentY, tableWidth, headerHeight, 2)
    this.doc.rect(tableX, this.currentY, tableWidth, headerHeight, 'F')

    // ヘッダーテキスト
    const headers = ['支援領域', '支援目標', '支援内容', '達成時期', '担当者', '優先度']
    let currentX = tableX
    
    headers.forEach((header, index) => {
      this.addText(header, currentX + 2, this.currentY + 10, {
        fontSize: 10,
        fontStyle: 'bold'
      })
      
      if (index < headers.length - 1) {
        this.doc.line(currentX + colWidths[index], this.currentY, currentX + colWidths[index], this.currentY + headerHeight)
      }
      currentX += colWidths[index]
    })

    this.currentY += headerHeight

    // 支援目標行の追加
    const goalKeys = ['employment', 'dailyLife', 'socialLife']
    const sectionKeys = ['employment', 'dailyLife', 'socialLife']

    goalKeys.forEach((key, index) => {
      if (!data.selectedSections.includes(sectionKeys[index])) return

      const goal = data.supportGoals[key]
      if (!goal) return
      
      // 動的な行の高さを計算
      const maxContentHeight = Math.max(
        this.calculateTextHeight(goal.objective, colWidths[1] - 4, 9),
        this.calculateTextHeight(goal.supportContent, colWidths[2] - 4, 9)
      )
      const rowHeight = Math.max(30, maxContentHeight + 8)

      // 行の背景と境界線
      this.drawBorder(tableX, this.currentY, tableWidth, rowHeight, 1)
      
      // 支援領域セルの背景
      this.doc.setFillColor(248, 248, 248)
      this.doc.rect(tableX, this.currentY, colWidths[0], rowHeight, 'F')

      currentX = tableX
      const values = [
        goal.itemName,
        goal.objective,
        goal.supportContent,
        goal.achievementPeriod,
        goal.provider,
        goal.priority
      ]

      values.forEach((value, colIndex) => {
        this.addText(value, currentX + 2, this.currentY + 10, {
          fontSize: colIndex === 0 ? 10 : 9,
          fontStyle: colIndex === 0 ? 'bold' : 'normal',
          maxWidth: colWidths[colIndex] - 4
        })
        
        if (colIndex < values.length - 1) {
          this.doc.line(currentX + colWidths[colIndex], this.currentY, currentX + colWidths[colIndex], this.currentY + rowHeight)
        }
        currentX += colWidths[colIndex]
      })

      this.currentY += rowHeight
    })

    this.currentY += 10
  }

  private addUserRoleTable(data: PDFPlanData) {
    const tableX = this.margin
    const tableWidth = this.pageWidth - (2 * this.margin)
    const headerHeight = 12

    // テーブルヘッダー
    this.doc.setFillColor(240, 240, 240)
    this.drawBorder(tableX, this.currentY, tableWidth, headerHeight, 2)
    this.doc.rect(tableX, this.currentY, tableWidth, headerHeight, 'F')

    // ヘッダーテキスト
    this.addText('支援領域', tableX + 2, this.currentY + 8, {
      fontSize: 12,
      fontStyle: 'bold'
    })
    this.addText('留意事項(本人の役割を含む)', tableX + (tableWidth * 0.25) + 2, this.currentY + 8, {
      fontSize: 12,
      fontStyle: 'bold'
    })

    // ヘッダー内の縦線
    this.doc.line(tableX + (tableWidth * 0.25), this.currentY, tableX + (tableWidth * 0.25), this.currentY + headerHeight)

    this.currentY += headerHeight

    // 各支援領域の留意事項
    const goalKeys = ['employment', 'dailyLife', 'socialLife']
    const sectionKeys = ['employment', 'dailyLife', 'socialLife']

    goalKeys.forEach((key, index) => {
      if (!data.selectedSections.includes(sectionKeys[index])) return

      const goal = data.supportGoals[key]
      if (!goal) return
      
      const textHeight = Math.max(25, this.calculateTextHeight(goal.userRole, tableWidth * 0.7, 11) + 8)

      this.drawBorder(tableX, this.currentY, tableWidth, textHeight, 1)
      
      // 支援領域セル背景
      this.doc.setFillColor(248, 248, 248)
      this.doc.rect(tableX, this.currentY, tableWidth * 0.25, textHeight, 'F')

      this.addText(goal.itemName, tableX + 2, this.currentY + 10, {
        fontSize: 11,
        fontStyle: 'bold'
      })

      this.addText(goal.userRole, tableX + (tableWidth * 0.25) + 2, this.currentY + 10, {
        fontSize: 11,
        maxWidth: tableWidth * 0.7
      })

      this.doc.line(tableX + (tableWidth * 0.25), this.currentY, tableX + (tableWidth * 0.25), this.currentY + textHeight)

      this.currentY += textHeight
    })

    this.currentY += 10
  }

  private addFooter() {
    const footerY = this.currentY + 10
    
    // 境界線
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY)

    // フッターテキスト
    this.addText('※この個別支援計画書は定期的に見直し・更新を行います。', 
      this.pageWidth / 2, footerY + 8, {
      fontSize: 9,
      align: 'center'
    })

    this.addText('作成者：サービス管理責任者　　　　承認者：管理者', 
      this.pageWidth / 2, footerY + 15, {
      fontSize: 9,
      align: 'center'
    })
  }

  private calculateTextHeight(text: string, maxWidth: number, fontSize: number): number {
    const processedText = this.processJapaneseText(text)
    const lines = this.doc.splitTextToSize(processedText, maxWidth)
    return lines.length * (fontSize * 0.4)
  }

  public async generatePDF(data: PDFPlanData): Promise<jsPDF> {
    // 日本語フォントのセットアップ
    await this.setupJapaneseFont()
    
    // PDFコンテンツの生成
    this.addHeader(data)
    this.addBasicInfoTable(data)
    this.addGoalsTable(data)
    this.addSupportGoalsTable(data)
    this.addUserRoleTable(data)
    this.addFooter()

    return this.doc
  }

  public async downloadPDF(data: PDFPlanData, filename: string = '個別支援計画書'): Promise<void> {
    const doc = await this.generatePDF(data)
    const date = new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')
    doc.save(`${filename}_${date}.pdf`)
  }

  public async generatePreviewBlob(data: PDFPlanData): Promise<Blob> {
    const doc = await this.generatePDF(data)
    return doc.output('blob')
  }
}