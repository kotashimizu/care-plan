export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
}

export function validateInterviewRecord(interviewRecord: string): ValidationResult {
  const warnings: ValidationWarning[] = [];
  
  if (!interviewRecord || interviewRecord.trim().length === 0) {
    return {
      isValid: false,
      warnings: [{
        field: 'interviewRecord',
        message: '面談記録が入力されていません',
        severity: 'high'
      }]
    };
  }

  // 基本的な項目チェック（キーワードベース）
  const requiredKeywords = {
    intentions: ['意向', '希望', '要望', '願い'],
    goals: ['目標', 'ゴール', '達成', '改善'],
    timeline: ['期間', '時期', '月', '年', 'まで', 'までに'],
    priorities: ['優先', '重要', '第一', '最初'],
    achievements: ['達成', '完了', '実現', '目指す']
  };

  // 本人・家族の意向に関する情報
  const hasIntentions = requiredKeywords.intentions.some(keyword => 
    interviewRecord.includes(keyword)
  );
  if (!hasIntentions) {
    warnings.push({
      field: 'intentions',
      message: '本人・家族の意向に関する情報が不足している可能性があります（「意向」「希望」等のキーワードが含まれていません）',
      severity: 'medium'
    });
  }

  // 目標に関する情報
  const hasGoals = requiredKeywords.goals.some(keyword => 
    interviewRecord.includes(keyword)
  );
  if (!hasGoals) {
    warnings.push({
      field: 'goals',
      message: '目標に関する情報が不足している可能性があります（「目標」「達成」等のキーワードが含まれていません）',
      severity: 'medium'
    });
  }

  // 期間・時期に関する情報
  const hasTimeline = requiredKeywords.timeline.some(keyword => 
    interviewRecord.includes(keyword)
  );
  if (!hasTimeline) {
    warnings.push({
      field: 'timeline',
      message: '達成時期に関する情報が不足している可能性があります（「期間」「時期」「月」等のキーワードが含まれていません）',
      severity: 'medium'
    });
  }

  // 優先順位に関する情報
  const hasPriorities = requiredKeywords.priorities.some(keyword => 
    interviewRecord.includes(keyword)
  );
  if (!hasPriorities) {
    warnings.push({
      field: 'priorities',
      message: '優先順位に関する情報が不足している可能性があります（「優先」「重要」等のキーワードが含まれていません）',
      severity: 'low'
    });
  }

  // 文字数チェック
  if (interviewRecord.length < 100) {
    warnings.push({
      field: 'length',
      message: '面談記録が短すぎる可能性があります。詳細な情報があると、より質の高い支援計画書が生成されます',
      severity: 'low'
    });
  }

  return {
    isValid: warnings.filter(w => w.severity === 'high').length === 0,
    warnings
  };
}

export function getValidationSummary(result: ValidationResult): string {
  if (result.warnings.length === 0) {
    return '入力データに問題は見つかりませんでした。';
  }

  const highWarnings = result.warnings.filter(w => w.severity === 'high');
  const mediumWarnings = result.warnings.filter(w => w.severity === 'medium');
  const lowWarnings = result.warnings.filter(w => w.severity === 'low');

  let summary = '';
  
  if (highWarnings.length > 0) {
    summary += `【重要】${highWarnings.length}件の重要な問題があります。\n`;
  }
  
  if (mediumWarnings.length > 0) {
    summary += `【注意】${mediumWarnings.length}件の注意事項があります。\n`;
  }
  
  if (lowWarnings.length > 0) {
    summary += `【推奨】${lowWarnings.length}件の改善提案があります。\n`;
  }

  summary += '\n不足している情報があると、支援計画書の質が低下する可能性があります。';
  
  return summary;
}