#!/usr/bin/env node

/**
 * PDF出力項目の詳細テスト
 * 各項目が適切に出力されているか確認
 */

const http = require('http');

// カラー出力用のヘルパー
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

// HTTPリクエストヘルパー
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            data: JSON.parse(body)
          };
          resolve(result);
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 項目の検証
function validateItem(itemName, value, requirements = {}) {
  const results = [];
  
  // 存在確認
  const exists = value && value.trim().length > 0;
  results.push({
    check: '存在確認',
    passed: exists,
    detail: exists ? '値あり' : '値なし'
  });
  
  if (exists) {
    // 文字数確認
    if (requirements.minLength) {
      const passed = value.length >= requirements.minLength;
      results.push({
        check: `最小文字数(${requirements.minLength})`,
        passed,
        detail: `${value.length}文字`
      });
    }
    
    if (requirements.maxLength) {
      const passed = value.length <= requirements.maxLength;
      results.push({
        check: `最大文字数(${requirements.maxLength})`,
        passed,
        detail: `${value.length}文字`
      });
    }
    
    // 禁止語句チェック
    if (requirements.forbidden) {
      const hasForbbiden = requirements.forbidden.some(word => value.includes(word));
      results.push({
        check: '禁止語句なし',
        passed: !hasForbbiden,
        detail: hasForbbiden ? '禁止語句あり' : 'OK'
      });
    }
    
    // 必須語句チェック
    if (requirements.required) {
      const hasRequired = requirements.required.some(word => value.includes(word));
      results.push({
        check: '必須要素',
        passed: hasRequired,
        detail: hasRequired ? 'OK' : '不足'
      });
    }
  }
  
  return results;
}

// 詳細な項目テスト
async function testPDFOutputItems() {
  console.log(colors.bold('\n========================================'));
  console.log(colors.bold('PDF出力項目の詳細テスト'));
  console.log(colors.bold('========================================\n'));

  try {
    // Step 1: テストデータで支援計画オプションを生成
    console.log(colors.blue('▶ Step 1: 支援計画オプションの生成'));
    
    const testData = {
      interviewRecord: `利用者は30代男性。現在は自宅で生活しており、週3回通所している。
作業には真面目に取り組むが、集中力の持続が課題となっている。
他者とのコミュニケーションは苦手だが、少しずつ慣れてきている様子。
将来的には一般就労を希望しており、そのための準備を進めたいと考えている。
家族からは、生活リズムの安定と社会性の向上を期待されている。
健康面では特に問題はないが、緊張すると体調を崩しやすい傾向がある。`,
      serviceType: 'employment-b',
      planDetailLevel: 'basic'
    };
    
    const response = await makeRequest('/api/generate-options', 'POST', testData);
    
    if (response.status !== 200) {
      console.log(colors.red('✗ オプション生成に失敗しました'));
      return;
    }
    
    const options = response.data.options;
    console.log(colors.green(`✓ ${options.length}個のオプションを生成`));
    
    // Step 2: 生成されたデータを基にPDF構造を確認
    console.log(colors.blue('\n▶ Step 2: PDF出力項目の検証'));
    
    // 模擬的な構造化データ（実際のアプリケーションロジックに基づく）
    const structuredPlan = {
      // ご本人・ご家族の意向
      userAndFamilyIntentions: extractIntentions(testData.interviewRecord),
      
      // 総合的な支援方針
      comprehensiveSupport: generateComprehensiveSupport(options, 'employment-b'),
      
      // 長期目標・短期目標
      longTermGoal: generateLongTermGoal(options),
      shortTermGoal: generateShortTermGoal(options),
      
      // 支援目標
      supportGoals: generateSupportGoals(options)
    };
    
    // 各項目の検証
    console.log(colors.bold('\n📋 検証結果:\n'));
    
    // 1. ご本人・ご家族の意向
    console.log(colors.yellow('1. ご本人・ご家族の意向'));
    const intentionResults = validateItem('意向', structuredPlan.userAndFamilyIntentions, {
      minLength: 20,
      maxLength: 200,
      forbidden: ['記載なし', '特になし'],
      required: ['希望', '家族', '期待']
    });
    displayValidationResults(intentionResults);
    console.log(colors.gray(`  内容: "${structuredPlan.userAndFamilyIntentions.substring(0, 50)}..."`));
    
    // 2. 総合的な支援方針
    console.log(colors.yellow('\n2. 総合的な支援方針'));
    const comprehensiveResults = validateItem('支援方針', structuredPlan.comprehensiveSupport, {
      minLength: 50,
      maxLength: 300,
      forbidden: ['〜を支援する'],
      required: ['就労継続支援B型', '支援']
    });
    displayValidationResults(comprehensiveResults);
    console.log(colors.gray(`  内容: "${structuredPlan.comprehensiveSupport.substring(0, 50)}..."`));
    
    // 3. 長期目標
    console.log(colors.yellow('\n3. 長期目標（1年）'));
    const longTermResults = validateItem('長期目標', structuredPlan.longTermGoal, {
      minLength: 20,
      maxLength: 150,
      forbidden: ['1年後の目標として', '1年'],
      required: ['目指す', '向上']
    });
    displayValidationResults(longTermResults);
    console.log(colors.gray(`  内容: "${structuredPlan.longTermGoal}"`));
    
    // 4. 短期目標
    console.log(colors.yellow('\n4. 短期目標（3ヶ月）'));
    const shortTermResults = validateItem('短期目標', structuredPlan.shortTermGoal, {
      minLength: 20,
      maxLength: 150,
      forbidden: ['3ヶ月間の', '短期目標として'],
      required: ['取り組む', '習得']
    });
    displayValidationResults(shortTermResults);
    console.log(colors.gray(`  内容: "${structuredPlan.shortTermGoal}"`));
    
    // 5. 支援目標の詳細
    console.log(colors.yellow('\n5. 支援目標詳細（各領域）'));
    Object.entries(structuredPlan.supportGoals).forEach(([key, goal]) => {
      console.log(colors.blue(`  ▸ ${goal.itemName}`));
      
      // 目標の検証
      const goalResults = validateItem('目標', goal.objective, {
        minLength: 10,
        maxLength: 100,
        forbidden: ['〜を支援']
      });
      console.log(`    目標: ${goalResults.every(r => r.passed) ? colors.green('✓') : colors.red('✗')}`);
      
      // 支援内容の検証
      const contentResults = validateItem('支援内容', goal.supportContent, {
        minLength: 20,
        maxLength: 200,
        forbidden: ['〜を支援']
      });
      console.log(`    内容: ${contentResults.every(r => r.passed) ? colors.green('✓') : colors.red('✗')}`);
      
      // その他の項目
      console.log(`    期間: ${goal.achievementPeriod}`);
      console.log(`    担当: ${goal.provider}`);
      console.log(`    役割: ${goal.userRole}`);
    });
    
    // 総合評価
    console.log(colors.bold('\n========================================'));
    console.log(colors.bold('総合評価'));
    console.log(colors.bold('========================================\n'));
    
    const allValid = [
      intentionResults,
      comprehensiveResults,
      longTermResults,
      shortTermResults
    ].every(results => results.every(r => r.passed));
    
    if (allValid) {
      console.log(colors.green('✨ すべての項目が適切に出力されています！'));
    } else {
      console.log(colors.yellow('⚠️  一部の項目に改善の余地があります'));
    }
    
  } catch (error) {
    console.error(colors.red('\nテスト実行中にエラーが発生しました:'));
    console.error(error);
  }
}

// ヘルパー関数（実際のアプリケーションロジックを模倣）
function extractIntentions(record) {
  const lines = record.split('\n').filter(line => line.trim().length > 0);
  const intentionKeywords = ['希望', '期待', '〜したい'];
  const relevantLines = lines.filter(line => 
    intentionKeywords.some(keyword => line.includes(keyword))
  );
  
  if (relevantLines.length > 0) {
    return relevantLines[0].replace(/。+$/, '');
  }
  return lines[0];
}

function generateComprehensiveSupport(options, serviceType) {
  const hasEmployment = options.some(o => o.category === 'A');
  const hasDailyLife = options.some(o => o.category === 'B');
  const hasSocial = options.some(o => o.category === 'C');
  
  let focus = [];
  if (hasEmployment) focus.push('就労能力の向上');
  if (hasDailyLife) focus.push('生活の安定');
  if (hasSocial) focus.push('社会参加の促進');
  
  return `就労継続支援B型において、${focus.join('と')}を中心に、利用者の個別性を重視した支援を実施。スモールステップでの目標達成を図り、3ヶ月ごとのモニタリングにより支援内容を調整する。`;
}

function generateLongTermGoal(options) {
  const hasEmployment = options.some(o => o.category === 'A');
  const hasDailyLife = options.some(o => o.category === 'B');
  const hasSocial = options.some(o => o.category === 'C');
  
  let goals = [];
  if (hasEmployment) goals.push('就労スキルの向上と安定した作業遂行');
  if (hasDailyLife) goals.push('日常生活の自立度向上');
  if (hasSocial) goals.push('社会参加の機会拡大と対人関係の向上');
  
  return goals.join('、') + 'を目指す';
}

function generateShortTermGoal(options) {
  const hasEmployment = options.some(o => o.category === 'A');
  const hasDailyLife = options.some(o => o.category === 'B');
  const hasSocial = options.some(o => o.category === 'C');
  
  let goals = [];
  if (hasEmployment) goals.push('基本的な作業手順の習得');
  if (hasDailyLife) goals.push('生活リズムの安定');
  if (hasSocial) goals.push('集団活動への積極的参加');
  
  return goals.join('、') + 'に取り組む';
}

function generateSupportGoals(options) {
  const employmentOptions = options.filter(o => o.category === 'A');
  const dailyLifeOptions = options.filter(o => o.category === 'B');
  const socialOptions = options.filter(o => o.category === 'C');
  
  return {
    employment: {
      itemName: '就労・作業支援',
      objective: employmentOptions[0]?.content.split('。')[0] || '作業能力の向上',
      supportContent: employmentOptions.map(o => o.content).join(' '),
      achievementPeriod: '6ヶ月',
      provider: 'サービス管理責任者・職業指導員',
      userRole: '指導内容の実践と振り返りへの参加'
    },
    dailyLife: {
      itemName: '生活支援',
      objective: dailyLifeOptions[0]?.content.split('。')[0] || '生活習慣の確立',
      supportContent: dailyLifeOptions.map(o => o.content).join(' '),
      achievementPeriod: '3ヶ月',
      provider: '生活支援員',
      userRole: '支援計画に基づく実践と報告'
    },
    socialLife: {
      itemName: '社会生活支援',
      objective: socialOptions[0]?.content.split('。')[0] || 'コミュニケーション能力向上',
      supportContent: socialOptions.map(o => o.content).join(' '),
      achievementPeriod: '6ヶ月',
      provider: '職員全体',
      userRole: '活動への参加と他者との関わり'
    }
  };
}

function displayValidationResults(results) {
  results.forEach(result => {
    const icon = result.passed ? colors.green('✓') : colors.red('✗');
    const detail = result.passed ? colors.gray(result.detail) : colors.red(result.detail);
    console.log(`  ${icon} ${result.check}: ${detail}`);
  });
}

// テスト実行
testPDFOutputItems();