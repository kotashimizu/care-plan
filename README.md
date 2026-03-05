# 個別支援計画書作成支援システム

AI を活用した個別支援計画書の作成支援Webアプリケーションです。福祉事業所のサービス管理責任者が面談記録を入力し、高品質な個別支援計画書を生成できます。

## 特徴

- **セキュア**: データ保存を行わず、クライアントサイドでの処理とAPI呼び出しのみ
- **高品質**: AI を活用した専門的で実現可能な計画書生成
- **多角的**: 3つの異なるアプローチでの代替案生成
- **品質保証**: 生成された計画書の品質チェック機能
- **使いやすい**: 直感的なUIとレスポンシブデザイン

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React 18, TypeScript
- **スタイリング**: Tailwind CSS, shadcn/ui コンポーネント
- **API**: Next.js API Routes (Edge Functions)
- **AI**: OpenAI GPT-4 (Anthropic Claude 対応予定)
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、必要な環境変数を設定してください。

```bash
cp .env.local.example .env.local
```

#### 必要な環境変数

- `OPENAI_API_KEY`: OpenAI API キー（必須）
- `ANTHROPIC_API_KEY`: Anthropic API キー（オプション）
- `NEXT_PUBLIC_APP_URL`: アプリケーションURL

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアクセスしてください。

## 使用方法

1. **事業所設定**: 事業所の種別、作業種別、特徴、利用者特性を設定
2. **面談記録入力**: 利用者との面談内容を詳細に入力
3. **計画書生成**: AI が個別支援計画書を自動生成
4. **品質チェック**: 生成された計画書の品質を評価・改善提案
5. **代替案生成**: 異なるアプローチでの計画書を比較検討

## API エンドポイント

### `/api/generate-plan`
個別支援計画書の生成

**リクエスト**:
```json
{
  "interviewRecord": "面談記録",
  "facilitySettings": { /* 事業所設定 */ },
  "requestType": "standard"
}
```

### `/api/quality-check`
計画書の品質チェック

**リクエスト**:
```json
{
  "plan": { /* 個別支援計画書 */ }
}
```

### `/api/generate-alternatives`
代替案の生成

**リクエスト**:
```json
{
  "interviewRecord": "面談記録",
  "facilitySettings": { /* 事業所設定 */ },
  "requestType": "alternatives"
}
```

## セキュリティ

- サーバーサイドでのデータ永続化なし
- クライアントサイド処理によるデータ保護
- HTTPS通信による暗号化
- 環境変数による API キー保護
- セッション終了時の自動データクリア

## 対応事業所種別

- 就労継続支援A型
- 就労継続支援B型
- 就労移行支援
- 生活介護
- 自立訓練（生活訓練）
- 自立訓練（機能訓練）

## コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# コード品質チェック
npm run lint
```

## デプロイ

Vercel での簡単デプロイに対応しています。

```bash
# Vercel CLI でデプロイ
npx vercel

# または GitHub 連携でのオートデプロイ
```

### 環境変数の設定（Vercel）

Vercel のダッシュボードで以下の環境変数を設定してください：

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`（オプション）
- `NODE_ENV=production`

## ライセンス

このプロジェクトは ISC ライセンスの下で公開されています。

## サポート

問題や質問がある場合は、Issue を作成してください。