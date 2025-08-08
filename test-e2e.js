#!/usr/bin/env node

/**
 * E2Eテストスクリプト
 * 個別支援計画書作成システムの全機能をテスト
 */

const http = require('http');

// テストデータ
const testData = {
  interviewRecord: `利用者は30代男性。現在は自宅で生活しており、週3回通所している。
作業には真面目に取り組むが、集中力の持続が課題となっている。
他者とのコミュニケーションは苦手だが、少しずつ慣れてきている様子。
将来的には一般就労を希望しており、そのための準備を進めたいと考えている。
家族からは、生活リズムの安定と社会性の向上を期待されている。`,
  serviceType: 'employment-b',
  planDetailLevel: 'basic'
};

// カラー出力用のヘルパー
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
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

// テスト結果の表示
function displayTestResult(testName, passed, details = '') {
  const status = passed ? colors.green('✓ PASS') : colors.red('✗ FAIL');
  console.log(`${status} ${testName}`);
  if (details) {
    console.log(`  ${colors.yellow('→')} ${details}`);
  }
}

// メインテスト関数
async function runE2ETests() {
  console.log(colors.bold('\n========================================'));
  console.log(colors.bold('個別支援計画書作成システム E2Eテスト'));
  console.log(colors.bold('========================================\n'));

  let allTestsPassed = true;
  const testResults = [];

  try {
    // Test 1: サーバー起動確認
    console.log(colors.blue('\n▶ Test 1: サーバー起動確認'));
    try {
      const healthCheck = await makeRequest('/');
      const test1Passed = healthCheck.status === 200;
      displayTestResult('サーバーが起動している', test1Passed, 
        `Status: ${healthCheck.status}`);
      testResults.push({ name: 'サーバー起動', passed: test1Passed });
      if (!test1Passed) allTestsPassed = false;
    } catch (error) {
      displayTestResult('サーバーが起動している', false, 
        'サーバーに接続できません。npm run dev を実行してください。');
      return;
    }

    // Test 2: generate-options APIテスト
    console.log(colors.blue('\n▶ Test 2: 支援計画オプション生成API'));
    const optionsResponse = await makeRequest('/api/generate-options', 'POST', testData);
    const test2Passed = optionsResponse.status === 200 && 
                        optionsResponse.data.options && 
                        Array.isArray(optionsResponse.data.options);
    
    displayTestResult('APIが正常にレスポンスを返す', 
      optionsResponse.status === 200, 
      `Status: ${optionsResponse.status}`);
    
    if (optionsResponse.status === 200) {
      const options = optionsResponse.data.options;
      
      // オプション数の確認
      displayTestResult('9つのオプションが生成される', 
        options.length === 9, 
        `生成数: ${options.length}/9`);
      
      // カテゴリ別の確認
      const categoryA = options.filter(o => o.category === 'A');
      const categoryB = options.filter(o => o.category === 'B');
      const categoryC = options.filter(o => o.category === 'C');
      
      displayTestResult('A項目（就労・作業支援）が3つ', 
        categoryA.length === 3, 
        `生成数: ${categoryA.length}/3`);
      
      displayTestResult('B項目（生活支援）が3つ', 
        categoryB.length === 3, 
        `生成数: ${categoryB.length}/3`);
      
      displayTestResult('C項目（社会生活支援）が3つ', 
        categoryC.length === 3, 
        `生成数: ${categoryC.length}/3`);
      
      // 各オプションの内容確認
      let allOptionsValid = true;
      options.forEach(option => {
        if (!option.id || !option.title || !option.content) {
          allOptionsValid = false;
        }
      });
      
      displayTestResult('全オプションに必要な項目が含まれる', 
        allOptionsValid, 
        allOptionsValid ? '全項目OK' : '一部項目が不足');
      
      // タイトルの文字数確認
      const titleLengthOK = options.every(o => o.title && o.title.length <= 15);
      displayTestResult('タイトルが適切な長さ', 
        titleLengthOK, 
        titleLengthOK ? '全タイトルOK' : '一部タイトルが長すぎる');
      
      // 内容の具体性確認
      const hasSpecificContent = options.every(o => 
        o.content && o.content.length > 20 && !o.content.includes('〜を支援する')
      );
      displayTestResult('支援内容が具体的', 
        hasSpecificContent, 
        hasSpecificContent ? '具体的な内容' : '曖昧な表現あり');
      
      // サンプル出力
      console.log(colors.blue('\n▶ 生成されたオプション例:'));
      if (categoryA[0]) {
        console.log(`  A項目: ${colors.green(categoryA[0].title)}`);
        console.log(`    内容: ${categoryA[0].content.substring(0, 50)}...`);
      }
      if (categoryB[0]) {
        console.log(`  B項目: ${colors.green(categoryB[0].title)}`);
        console.log(`    内容: ${categoryB[0].content.substring(0, 50)}...`);
      }
      if (categoryC[0]) {
        console.log(`  C項目: ${colors.green(categoryC[0].title)}`);
        console.log(`    内容: ${categoryC[0].content.substring(0, 50)}...`);
      }
      
      testResults.push({ 
        name: '支援計画オプション生成', 
        passed: test2Passed && allOptionsValid 
      });
      
    } else {
      console.log(colors.red('  エラー内容:'), optionsResponse.data);
      testResults.push({ name: '支援計画オプション生成', passed: false });
      allTestsPassed = false;
    }

    // Test 3: 面談記録の個別性反映確認
    console.log(colors.blue('\n▶ Test 3: 個別性の反映確認'));
    if (optionsResponse.status === 200) {
      const options = optionsResponse.data.options;
      const keywords = ['集中力', '就労', 'コミュニケーション', '生活リズム'];
      let reflectedCount = 0;
      
      keywords.forEach(keyword => {
        const reflected = options.some(o => 
          o.content.includes(keyword) || o.title.includes(keyword)
        );
        if (reflected) reflectedCount++;
      });
      
      const individualityPassed = reflectedCount >= 2;
      displayTestResult('面談記録の内容が反映されている', 
        individualityPassed, 
        `キーワード反映: ${reflectedCount}/${keywords.length}`);
      
      testResults.push({ 
        name: '個別性の反映', 
        passed: individualityPassed 
      });
      
      if (!individualityPassed) allTestsPassed = false;
    }

    // Test 4: エラーハンドリング確認
    console.log(colors.blue('\n▶ Test 4: エラーハンドリング'));
    
    // 不正なリクエスト
    const invalidResponse = await makeRequest('/api/generate-options', 'POST', {});
    displayTestResult('必須パラメータ不足でエラーを返す', 
      invalidResponse.status === 400, 
      `Status: ${invalidResponse.status}`);
    
    // 不正なserviceType
    const invalidServiceType = await makeRequest('/api/generate-options', 'POST', {
      ...testData,
      serviceType: 'invalid'
    });
    displayTestResult('不正なserviceTypeでエラーを返す', 
      invalidServiceType.status === 400 || invalidServiceType.status === 500, 
      `Status: ${invalidServiceType.status}`);
    
    testResults.push({ 
      name: 'エラーハンドリング', 
      passed: invalidResponse.status === 400 
    });

  } catch (error) {
    console.error(colors.red('\nテスト実行中にエラーが発生しました:'));
    console.error(error);
    allTestsPassed = false;
  }

  // テスト結果サマリー
  console.log(colors.bold('\n========================================'));
  console.log(colors.bold('テスト結果サマリー'));
  console.log(colors.bold('========================================'));
  
  const passedTests = testResults.filter(t => t.passed).length;
  const totalTests = testResults.length;
  const passRate = Math.round((passedTests / totalTests) * 100);
  
  console.log(`\n合格: ${colors.green(passedTests)}/${totalTests} (${passRate}%)`);
  
  testResults.forEach(result => {
    const icon = result.passed ? colors.green('✓') : colors.red('✗');
    console.log(`  ${icon} ${result.name}`);
  });
  
  if (allTestsPassed) {
    console.log(colors.green('\n✨ すべてのテストが合格しました！'));
  } else {
    console.log(colors.red('\n⚠️  一部のテストが失敗しました。'));
  }
  
  console.log('\n');
  process.exit(allTestsPassed ? 0 : 1);
}

// テスト実行
console.log(colors.yellow('Next.jsサーバーが起動していることを確認してください...'));
setTimeout(runE2ETests, 1000);