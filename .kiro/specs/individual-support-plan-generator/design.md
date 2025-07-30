# 設計書

## 概要

個別支援計画書作成支援Webアプリケーションは、福祉事業所のサービス管理責任者が面談記録を入力し、AI APIを活用して高品質な個別支援計画書を生成するセキュアなシステムです。データ保存を行わず、クライアントサイドでの処理とAPI呼び出しのみで動作します。

## アーキテクチャ

### システム構成

```
[ブラウザ] ←→ [Next.js App] ←→ [AI API (OpenAI/Claude等)]
     ↑              ↑
[ローカルストレージ]  [Vercel Edge Functions]
```

### 技術スタック

- **フロントエンド**: Next.js 15.4.3 (App Router), React 19, TypeScript 5.8.3
- **スタイリング**: Tailwind CSS 3.4.16, shadcn/ui コンポーネント
- **状態管理**: React useState/useReducer (クライアントサイド)
- **API**: Next.js API Routes (Node.js Runtime - Edge Runtimeから変更)
- **デプロイ**: Vercel
- **AI API**: OpenAI GPT-4 (max_tokens: 2200, timeout: 35s)

### セキュリティ設計

1. **データ非保存**: サーバーサイドでのデータ永続化なし
2. **クライアントサイド処理**: 入力データはブラウザメモリのみで管理
3. **API キー保護**: 環境変数でのAPI キー管理
4. **HTTPS通信**: すべての通信をHTTPS で暗号化
5. **セッション管理**: ページリロード時のデータクリア

## コンポーネント設計

### 1. メインレイアウト (`app/layout.tsx`)

```typescript
interface RootLayoutProps {
  children: React.ReactNode;
}

// レスポンシブデザイン対応のメインレイアウト
// ヘッダー、フッター、メインコンテンツエリア
```

### 2. ホームページ (`app/page.tsx`)

```typescript
interface HomePageState {
  interviewRecord: string;
  facilitySettings: FacilitySettings;
  generatedPlan: IndividualSupportPlan | null;
  isGenerating: boolean;
  error: string | null;
}

// メイン機能を統合したページコンポーネント
```

### 3. 設定パネル (`components/FacilitySettingsPanel.tsx`)

```typescript
interface FacilitySettings {
  facilityType: 'employment-a' | 'employment-b' | 'transition' | 'daily-care' | 'training-life' | 'training-function';
  workTypes: string[];
  facilityFeatures: string[];
  userCharacteristics: {
    ageGroup: string;
    disabilityTypes: string[];
    averageUsagePeriod: string;
    userCount: number;
  };
}

// 事業所特性設定のためのフォームコンポーネント
```

### 4. 面談記録入力 (`components/InterviewRecordInput.tsx`)

```typescript
interface InterviewRecordInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

// 面談記録入力用のテキストエリアコンポーネント
```

### 5. 計画書表示 (`components/SupportPlanDisplay.tsx`)

```typescript
interface IndividualSupportPlan {
  userAndFamilyIntentions: string;
  comprehensiveSupport: string;
  longTermGoal: string;
  shortTermGoal: string;
  supportGoals: {
    employment: SupportGoal;
    dailyLife: SupportGoal;
    socialLife: SupportGoal;
  };
  qualityScore: QualityScore;
}

interface SupportGoal {
  objective: string;
  userRole: string;
  supportContent: string;
  frequency: string;
  evaluation: string;
}

// 生成された計画書の表示とコピー機能
```

### 6. 品質チェック (`components/QualityCheck.tsx`)

```typescript
interface QualityScore {
  expertise: number;
  specificity: number;
  feasibility: number;
  consistency: number;
  overall: number;
}

// 品質スコア表示と改善提案機能
```

### 7. 代替案生成 (`components/AlternativePlans.tsx`)

```typescript
interface AlternativePlan {
  type: 'employment-focused' | 'life-focused' | 'social-focused';
  title: string;
  description: string;
  plan: IndividualSupportPlan;
}

// 3つの代替案生成と表示機能
```

### 8. テキスト編集機能 (`components/EditableSupportPlan.tsx`) - 計画中

```typescript
interface EditableSupportPlanProps {
  plan: IndividualSupportPlan;
  onSave: (updatedPlan: IndividualSupportPlan) => void;
  onCancel: () => void;
}

// React ContentEditableを使用した計画書編集機能
// - インライン編集モード
// - 保存/キャンセル機能
// - 編集状態管理
```

### 9. PDF出力機能 (`components/PDFExport.tsx`) - 計画中

```typescript
interface PDFExportProps {
  plan: IndividualSupportPlan;
  facilityInfo?: FacilitySettings;
}

// @react-pdf/rendererを使用したPDF生成機能
// - A4サイズでの出力
// - 事業所情報、作成日時、ページ番号
// - 印刷に適したレイアウト
```

## データモデル

### API リクエスト形式

```typescript
interface GeneratePlanRequest {
  interviewRecord: string;
  facilitySettings: FacilitySettings;
  requestType: 'standard' | 'quality-check' | 'alternatives';
}

interface GeneratePlanResponse {
  plan: IndividualSupportPlan;
  alternatives?: AlternativePlan[];
  qualityCheck?: QualityCheckResult;
}
```

### プロンプト構造

```typescript
interface PromptTemplate {
  systemPrompt: string;
  userPrompt: string;
  facilityContext: string;
  userCharacteristics: string;
}

// GPTsプロンプト設計書の内容を基にした構造化プロンプト
```

## API設計

### 1. 計画書生成API (`/api/generate-plan`)

```typescript
// POST /api/generate-plan
// リクエスト: GeneratePlanRequest
// レスポンス: GeneratePlanResponse

// Node.js Runtime として実装（504エラー対策）
// AI APIへのプロキシ機能
// エラーハンドリングとレート制限対応
// タイムアウト: 35秒、max_tokens: 2200
```

### 2. 品質チェックAPI (`/api/quality-check`)

```typescript
// POST /api/quality-check
// 生成された計画書の品質評価
// 改善提案の生成
```

### 3. 代替案生成API (`/api/generate-alternatives`)

```typescript
// POST /api/generate-alternatives
// 3つの異なるアプローチでの代替案生成
```

## エラーハンドリング

### エラー種別と対応

1. **API エラー**
   - 接続エラー: 再試行ボタン表示
   - 認証エラー: システム管理者への連絡案内
   - レート制限: 待機時間表示
   - **✅ 実装済み** 504タイムアウトエラー: Node.js Runtime + 最適化されたプロンプト + Vercel関数タイムアウト設定で解決

2. **入力エラー**
   - 空の面談記録: 入力促進メッセージ
   - 不適切な内容: 具体的な修正指示

3. **システムエラー**
   - 予期しないエラー: 一般的なエラーメッセージ
   - ネットワークエラー: オフライン対応案内
   - **✅ 実装済み** JSON解析エラー: コンテンツクリーニング機能で対応

## テスト戦略

### 1. 単体テスト
- コンポーネントの動作確認
- API関数のテスト
- プロンプト生成ロジックのテスト

### 2. 統合テスト
- API呼び出しフローのテスト
- エラーハンドリングのテスト
- レスポンシブデザインのテスト

### 3. E2Eテスト
- 計画書生成の完全フローテスト
- 異なるデバイスでの動作確認
- セキュリティ要件の検証

## パフォーマンス最適化

### 1. フロントエンド最適化
- コンポーネントの遅延読み込み
- 画像最適化（Next.js Image）
- バンドルサイズ最適化

### 2. API最適化
- Edge Functions活用
- レスポンスキャッシュ（短時間）
- 並列処理での代替案生成

### 3. UX最適化
- 生成中のローディング表示
- プログレスインジケーター
- 段階的な結果表示

## セキュリティ実装

### 1. データ保護
- メモリ内処理のみ
- セッション終了時のデータクリア
- ローカルストレージ使用なし

### 2. API セキュリティ
- 環境変数でのキー管理
- CORS設定
- レート制限実装

### 3. 入力検証
- XSS対策
- 入力サニタイゼーション
- CSRFトークン（必要に応じて）

## デプロイメント設計

### Vercel設定

```javascript
// vercel.json - 504エラー対策として更新
{
  "functions": {
    "src/app/api/generate-plan/route.ts": { "maxDuration": 60 },
    "src/app/api/quality-check/route.ts": { "maxDuration": 30 }
  }
}
```

**重要**: Edge Runtimeは30秒制限のためNode.js Runtimeに変更済み

### 環境変数

- `OPENAI_API_KEY`: OpenAI API キー（現在使用中）
- `NODE_ENV`: 環境設定
- `NEXT_PUBLIC_APP_URL`: アプリケーションURL

**注意**: Anthropic API使用は不採用に決定

## 運用・監視

### 1. ログ管理
- API呼び出しログ（個人情報除外）
- エラーログ
- パフォーマンスメトリクス

### 2. 監視項目
- API応答時間
- エラー率
- 利用状況統計

### 3. アラート設定
- API障害検知
- 異常なトラフィック検知
- エラー率閾値超過