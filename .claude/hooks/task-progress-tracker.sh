#!/bin/bash
# ShiftCare360 タスク進捗トラッカー - 詳細な進捗分析

echo "📊 ShiftCare360 詳細タスク分析"

if [ -f "./tasks/current-tasks.md" ]; then
    # 全体進捗の計算
    total_tasks=$(grep -c "\\- \\[" ./tasks/current-tasks.md 2>/dev/null || echo "0")
    completed_tasks=$(grep -c "\\- \\[x\\]" ./tasks/current-tasks.md 2>/dev/null || echo "0")
    
    if [ "$total_tasks" -gt 0 ]; then
        progress=$((completed_tasks * 100 / total_tasks))
        echo "📈 全体進捗: $completed_tasks/$total_tasks ($progress%)"
        
        # 現在の実装フェーズを特定
        echo "🎯 現在のフェーズ:"
        if [ "$progress" -lt 10 ]; then
            echo "   1️⃣ プロジェクト基盤構築中"
        elif [ "$progress" -lt 25 ]; then
            echo "   2️⃣ 認証システム実装中"
        elif [ "$progress" -lt 40 ]; then
            echo "   3️⃣ データ管理システム実装中"
        elif [ "$progress" -lt 60 ]; then
            echo "   4️⃣ シフト管理システム実装中"
        elif [ "$progress" -lt 75 ]; then
            echo "   5️⃣ GPS・ルート最適化実装中"
        elif [ "$progress" -lt 90 ]; then
            echo "   6️⃣ 評価・給与システム実装中"
        else
            echo "   7️⃣ 最終テスト・デプロイ準備中"
        fi
        
        echo ""
        echo "🔥 次に取り組むべきタスク:"
        grep -A2 "\\- \\[ \\]" ./tasks/current-tasks.md | head -6
        
        echo ""
        echo "✅ 最近完了したタスク:"
        grep "\\- \\[x\\]" ./tasks/current-tasks.md | tail -3
    else
        echo "📝 タスクが設定されていません"
    fi
else
    echo "⚠️  タスクファイルが見つかりません: ./tasks/current-tasks.md"
fi

# 今日の作業履歴表示
if [ -f "./progress/daily-log.md" ]; then
    echo ""
    echo "📅 今日の作業履歴:"
    grep "$(date +%Y-%m-%d)" ./progress/daily-log.md 2>/dev/null | tail -5 || echo "本日はまだ作業履歴がありません"
fi