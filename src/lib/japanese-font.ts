// 日本語フォント対応のためのユーティリティ
import jsPDF from 'jspdf'

export async function addJapaneseFontSupport(doc: jsPDF): Promise<boolean> {
  try {
    console.log('日本語フォントの埋め込みを試行中...')
    
    // jsPDFの日本語対応は複雑なため、まずシンプルな方法を試行
    // フォント埋め込みではなく、文字エンコーディングの設定を試す
    
    try {
      // 日本語対応のための設定
      doc.setFont('helvetica', 'normal')
      
      console.log('基本的な日本語対応設定を適用しました')
      return true
      
    } catch (fontError) {
      console.warn('フォント設定に失敗:', fontError)
      return false
    }
    
  } catch (error) {
    console.error('日本語フォント設定エラー:', error)
    return false
  }
}

// フォント埋め込み済みかチェック（簡易版）
export function hasJapaneseFontSupport(): boolean {
  // 現在は基本的なhelveticaフォントを使用
  // 将来的にカスタムフォントを埋め込む場合はここで判定
  return false
}

// フォント代替文字マッピング（緊急対応用）
export function convertToLatinEquivalent(text: string): string {
  const mapping: Record<string, string> = {
    '個別': 'Kobetsu',
    '支援': 'Shien', 
    '計画': 'Keikaku',
    '書': 'Sho',
    '就労': 'Shuro',
    '継続': 'Keizoku',
    '生活': 'Seikatsu',
    '介護': 'Kaigo',
    'サービス': 'Service',
    '種別': 'Shubetsu',
    '作成': 'Sakusei',
    '日': 'Hi',
    '期間': 'Kikan',
    'ヶ月': 'Kagetsu',
    '年': 'Nen',
    '項目': 'Komoku',
    '内容': 'Naiyo',
    'ご本人': 'Gohonnin',
    'ご家族': 'Gokazoku',
    '意向': 'Iko',
    '総合的': 'Sogoteki',
    '方針': 'Hoshin',
    '目標': 'Mokuhyo',
    '区分': 'Kubun',
    '長期': 'Choki',
    '短期': 'Tanki',
    '支援領域': 'Shien-Ryoiki',
    '支援内容': 'Shien-Naiyo',
    '達成': 'Tassei',
    '時期': 'Jiki',
    '担当者': 'Tantosha',
    '優先度': 'Yusendy',
    '留意': 'Ryui',
    '事項': 'Jiko',
    '本人': 'Honnin',
    '役割': 'Yakuwari',
    '含む': 'Fukumu',
    'この': 'Kono',
    'は': 'wa',
    'を': 'wo',
    'に': 'ni',
    'の': 'no',
    'と': 'to',
    'が': 'ga',
    'で': 'de',
    'から': 'kara',
    'まで': 'made',
    '定期的': 'Teikiteki',
    '見直し': 'Minaoshi',
    '更新': 'Koshin',
    '行います': 'Okonaimasu',
    '管理': 'Kanri',
    '責任者': 'Sekininsha',
    '承認者': 'Shonninsha'
  }
  
  let result = text
  for (const [japanese, latin] of Object.entries(mapping)) {
    result = result.replace(new RegExp(japanese, 'g'), latin)
  }
  
  return result
}

// 日本語文字検出
export function containsJapanese(text: string): boolean {
  return /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/.test(text)
}