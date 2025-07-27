#!/usr/bin/env node

/**
 * Test Runner Script for KidsGPT
 * 
 * This script provides automated testing capabilities and can be run
 * after every code change to ensure no regressions.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 KidsGPT Test Runner');
console.log('====================\n');

// Test configuration
const tests = {
  unit: {
    name: 'Unit Tests',
    command: 'npm test -- --passWithNoTests',
    description: 'Running Jest unit tests...'
  },
  build: {
    name: 'Build Check',
    command: 'npm run build',
    description: 'Checking if application builds successfully...'
  },
  typecheck: {
    name: 'TypeScript Check',
    command: 'npx tsc --noEmit',
    description: 'Running TypeScript type checking...'
  },
  lint: {
    name: 'ESLint Check',
    command: 'npx eslint src --ext .ts,.tsx',
    description: 'Running ESLint code quality checks...'
  }
};

// Function to run a single test
function runTest(testKey) {
  const test = tests[testKey];
  return new Promise((resolve, reject) => {
    console.log(`📋 ${test.description}`);
    
    exec(test.command, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ ${test.name} failed:`);
        console.log(stderr || stdout);
        reject(error);
      } else {
        console.log(`✅ ${test.name} passed`);
        resolve(stdout);
      }
    });
  });
}

// Function to run all tests
async function runAllTests() {
  console.log('Running automated regression tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testKey of Object.keys(tests)) {
    try {
      await runTest(testKey);
      passed++;
    } catch (error) {
      failed++;
    }
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Please fix the issues before deploying.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! Code is ready for deployment.');
  }
}

// Function to check for critical files
function checkCriticalFiles() {
  const criticalFiles = [
    'src/App.tsx',
    'src/contexts/AuthContext.tsx',
    'src/pages/Index.tsx',
    'src/pages/ParentDashboard.tsx',
    'src/services/conversationService.ts',
    'src/services/openAIService.ts'
  ];
  
  console.log('🔍 Checking critical files...');
  
  for (const file of criticalFiles) {
    if (!fs.existsSync(file)) {
      console.log(`❌ Critical file missing: ${file}`);
      return false;
    }
  }
  
  console.log('✅ All critical files present\n');
  return true;
}

// Function to display manual test checklist
function showManualChecklist() {
  console.log('📋 Manual Test Checklist:');
  console.log('========================');
  console.log('After running automated tests, please verify:');
  console.log('');
  console.log('🔐 Authentication:');
  console.log('  □ Parent login works');
  console.log('  □ Child login works');
  console.log('  □ Sign out clears session');
  console.log('');
  console.log('🛣️  Routing:');
  console.log('  □ /chat redirects to /');
  console.log('  □ /chats redirects to /');
  console.log('  □ Unknown routes show 404');
  console.log('');
  console.log('💬 Chat:');
  console.log('  □ New conversation creation');
  console.log('  □ Message sending');
  console.log('  □ AI response generation');
  console.log('');
  console.log('👨‍👩‍👧‍👦 Parent Features:');
  console.log('  □ Parent dashboard access');
  console.log('  □ Child conversation viewing');
  console.log('  □ Analytics display');
  console.log('');
  console.log('For detailed checklist, see: src/test/test-checklist.md');
}

// Main execution
async function main() {
  // Check if this is a regression test run
  const args = process.argv.slice(2);
  const isRegression = args.includes('--regression');
  
  // Always check critical files first
  if (!checkCriticalFiles()) {
    process.exit(1);
  }
  
  try {
    await runAllTests();
    
    if (isRegression) {
      console.log('\n🔄 Regression Test Complete');
      console.log('Please run manual tests to verify functionality.');
    } else {
      showManualChecklist();
    }
  } catch (error) {
    console.log('\n💥 Test suite failed!');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}