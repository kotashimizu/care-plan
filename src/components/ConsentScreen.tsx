'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, Lock } from 'lucide-react'

interface ConsentScreenProps {
  onConsent: (password: string) => void
}

export default function ConsentScreen({ onConsent }: ConsentScreenProps) {
  const [agreed, setAgreed] = useState(false)
  const [password, setPassword] = useState('')
  const [showPolicy, setShowPolicy] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (agreed) {
      onConsent(password)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            個別支援計画書作成支援システム
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            ご利用にあたり、以下の内容をご確認のうえ同意してください。
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* データの取り扱いについて */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">データの取り扱いについて</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm text-gray-700">
              <p><strong>1. 収集するデータ</strong></p>
              <p>本システムでは、面談記録（利用者の障害種別、生活状況、希望等を含む）を入力いただきます。これらは個人情報保護法における「要配慮個人情報」に該当する場合があります。</p>

              <p><strong>2. データの利用目的</strong></p>
              <p>入力されたデータは、個別支援計画書の生成のみに使用されます。</p>

              <p><strong>3. AI処理について</strong></p>
              <p>面談記録はGoogle Gemini API（Google Cloud）に送信され、支援計画の生成に使用されます。Google Cloudは送信されたデータをAIモデルの学習には使用しません。</p>

              <p><strong>4. データの保存</strong></p>
              <p>本システムはサーバーにデータを保存しません。ブラウザを閉じると入力内容は消去されます。生成されたPDFはお使いの端末にダウンロードされます。</p>

              <p><strong>5. セキュリティ対策</strong></p>
              <p>すべての通信はHTTPS（暗号化通信）で行われます。APIアクセスにはパスワード認証を実施しています。</p>
            </div>
          </div>

          {/* プライバシーポリシー詳細 */}
          <div>
            <button
              type="button"
              onClick={() => setShowPolicy(!showPolicy)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {showPolicy ? 'プライバシーポリシーを閉じる' : 'プライバシーポリシー全文を表示'}
            </button>

            {showPolicy && (
              <div className="mt-3 bg-gray-50 border rounded-lg p-4 text-sm text-gray-700 space-y-3 max-h-64 overflow-y-auto">
                <h4 className="font-semibold">プライバシーポリシー</h4>
                <p>本プライバシーポリシーは、個別支援計画書作成支援システム（以下「本システム」）における個人情報の取り扱いについて定めるものです。</p>

                <p><strong>第1条（個人情報の定義）</strong></p>
                <p>本システムにおける個人情報とは、面談記録に含まれる利用者の氏名、障害種別、病歴、生活状況、家族構成等、特定の個人を識別できる情報を指します。</p>

                <p><strong>第2条（要配慮個人情報の取扱い）</strong></p>
                <p>面談記録に含まれる障害種別、病歴等は「要配慮個人情報」に該当します。本システムは、利用者本人の同意を得た上でのみこれらの情報を取り扱います。</p>

                <p><strong>第3条（利用目的）</strong></p>
                <p>取得した個人情報は、個別支援計画書の生成のみを目的として使用します。</p>

                <p><strong>第4条（第三者への提供）</strong></p>
                <p>入力されたデータはGoogle Cloud（Gemini API）に業務委託として送信されます。Google CloudとはData Processing Addendum（データ処理契約）に基づき、データの適切な取り扱いが保証されています。それ以外の第三者には提供しません。</p>

                <p><strong>第5条（データの保存・削除）</strong></p>
                <p>本システムはサーバーにデータを一切保存しません。ブラウザセッション終了時にすべてのデータは消去されます。</p>

                <p><strong>第6条（安全管理措置）</strong></p>
                <p>HTTPS通信による暗号化、APIアクセス認証、セキュリティヘッダーの設定等、適切な安全管理措置を講じています。</p>

                <p><strong>第7条（お問い合わせ）</strong></p>
                <p>個人情報の取り扱いに関するお問い合わせは、システム管理者までご連絡ください。</p>
              </div>
            )}
          </div>

          {/* 同意フォーム */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="consent"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
              />
              <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                上記のデータの取り扱いについて理解し、利用者本人の同意を得た上で面談記録を入力することに同意します。
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                アクセスパスワード
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="管理者から提供されたパスワードを入力"
              />
              <p className="text-xs text-gray-500">
                パスワードが設定されていない場合は空欄のまま進めます。
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!agreed}
            >
              同意して利用を開始する
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
