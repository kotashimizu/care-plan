// 軽量Noto Sans JPフォントデータ（サブセット版）
// 実際のプロジェクトではGoogle Fontsから完全版をダウンロード

// 基本的な日本語文字（ひらがな・カタカナ・よく使われる漢字）をサポートする軽量版
// ファイルサイズを抑えるため、必要最小限の文字セットのみ含む

export const NOTO_SANS_JP_BASE64_SUBSET = `
TTF_FONT_DATA_PLACEHOLDER
`;

// 実際の実装時はこちらを使用
// 1. Google Fontsから Noto Sans JP をダウンロード
// 2. サブセット化ツールで必要な文字のみ抽出
// 3. Base64エンコード

export const JAPANESE_FONT_FALLBACK = {
  family: 'NotoSansJP',
  style: 'normal',
  weight: 'normal'
};

// 代替案: Web Font APIを使用した動的読み込み
export async function loadJapaneseFontFromCDN(): Promise<string | null> {
  try {
    // Google Fonts APIから軽量版を取得
    // User-Agentを指定してWOFFではなくTTF/OTFを取得
    const response = await fetch('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400&display=swap', {
      headers: {
        'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)'
      }
    });
    const cssText = await response.text();
    
    // CSSから実際のフォントURLを抽出（複数のurlパターンに対応）
    const fontUrlMatches = cssText.matchAll(/url\(([^)]+)\)/g);
    let fontUrl = null;
    
    for (const match of fontUrlMatches) {
      const url = match[1].replace(/['"]/g, '');
      // TTFまたはOTFフォーマットを優先
      if (url.includes('.ttf') || url.includes('.otf') || url.includes('truetype')) {
        fontUrl = url;
        break;
      }
    }
    
    if (!fontUrl) {
      // フォールバック: 最初に見つかったURLを使用
      const firstMatch = cssText.match(/url\(([^)]+)\)/);
      if (!firstMatch) return null;
      fontUrl = firstMatch[1].replace(/['"]/g, '');
    }
    
    console.log('フォントURL:', fontUrl);
    
    // フォントファイルを取得
    const fontResponse = await fetch(fontUrl);
    if (!fontResponse.ok) {
      throw new Error(`フォント取得失敗: ${fontResponse.status}`);
    }
    
    const fontBuffer = await fontResponse.arrayBuffer();
    
    // Base64エンコード（大きなバイナリデータを効率的に処理）
    const uint8Array = new Uint8Array(fontBuffer);
    let binaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode(...chunk);
    }
    
    const base64Font = btoa(binaryString);
    console.log(`フォントBase64エンコード完了: ${base64Font.length}文字`);
    return base64Font;
    
  } catch (error) {
    console.error('日本語フォントの読み込みに失敗:', error);
    return null;
  }
}

// フォントキャッシュ機能
let cachedFontBase64: string | null = null;
let fontLoadingPromise: Promise<string | null> | null = null;

export async function getCachedJapaneseFont(): Promise<string | null> {
  if (cachedFontBase64) {
    return cachedFontBase64;
  }
  
  if (fontLoadingPromise) {
    return await fontLoadingPromise;
  }
  
  fontLoadingPromise = loadJapaneseFontFromCDN();
  cachedFontBase64 = await fontLoadingPromise;
  fontLoadingPromise = null;
  
  return cachedFontBase64;
}

// よく使われる漢字・ひらがな・カタカナのリスト（サブセット用）
export const COMMON_JAPANESE_CHARS = [
  // ひらがな
  'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',
  'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ',
  
  // カタカナ  
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
  'ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ',
  
  // よく使われる漢字（個別支援計画書関連）
  '個別支援計画書就労継続生活介護サービス種別作成日期間項目内容本人家族意向総合的方針目標区分長期短期',
  '領域達成時担当者優先度留意事項役割含定期見直更新行管理責任承認年月週日時分秒'
].join('');