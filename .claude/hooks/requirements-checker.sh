#!/bin/bash
# ShiftCare360 要件チェッカー - 編集内容と要件定義の関連性を確認

echo "🔍 ShiftCare360 要件関連性チェック"

# 編集されたファイルパスを取得
file_path="$CLAUDE_FILE_PATHS"
file_name=$(basename "$file_path")

if [ -f "./docs/requirements.md" ]; then
    echo "📋 編集ファイル: $file_name"
    echo "--- 関連する要件項目 ---"
    
    # ファイル名や機能名から関連要件を推測
    case "$file_name" in
        *auth* | *login* | *user*)
            echo "🔐 認証・権限関連 - 要件10を確認"
            grep -A5 "要件10" ./docs/requirements.md
            ;;
        *shift* | *schedule*)
            echo "📅 シフト管理関連 - 要件1,2,3,4を確認"
            grep -A3 "要件[1-4]" ./docs/requirements.md | head -10
            ;;
        *gps* | *visit* | *location*)
            echo "📍 GPS・訪問記録関連 - 要件5,6を確認"
            grep -A3 "要件[5-6]" ./docs/requirements.md
            ;;
        *salary* | *payment*)
            echo "💰 給与計算関連 - 要件7を確認"
            grep -A3 "要件7" ./docs/requirements.md
            ;;
        *evaluation* | *rating*)
            echo "⭐ 利用者評価関連 - 要件8を確認"
            grep -A3 "要件8" ./docs/requirements.md
            ;;
        *client* | *user*)
            echo "👥 利用者管理関連 - 要件9を確認"
            grep -A3 "要件9" ./docs/requirements.md
            ;;
        *ui* | *component* | *page*)
            echo "🎨 UI/UX関連 - 要件11を確認"
            grep -A3 "要件11" ./docs/requirements.md
            ;;
        *)
            echo "📖 全般的な要件確認が必要です"
            echo "要件定義書で関連項目を確認してください: ./docs/requirements.md"
            ;;
    esac
else
    echo "⚠️  要件定義書が見つかりません"
fi