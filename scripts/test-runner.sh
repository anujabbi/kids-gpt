#!/bin/bash

# KidsGPT Test Runner Script
# Run this after every code change to check for regressions

echo "🧪 KidsGPT Regression Test Suite"
echo "================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}Running $test_name...${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $test_name passed${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $test_name failed${NC}"
        ((FAILED++))
        
        # Show error details
        echo "Error details:"
        eval "$test_command"
        echo ""
    fi
}

# Critical file check
echo "🔍 Checking critical files..."
CRITICAL_FILES=(
    "src/App.tsx"
    "src/contexts/AuthContext.tsx" 
    "src/pages/Index.tsx"
    "src/pages/ParentDashboard.tsx"
    "src/services/conversationService.ts"
    "src/services/openAIService.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Critical file missing: $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ All critical files present${NC}"
echo ""

# Run automated tests
echo "🤖 Running automated tests..."
echo ""

run_test "TypeScript compilation" "npx tsc --noEmit"
run_test "ESLint checks" "npx eslint src --ext .ts,.tsx --max-warnings 0"
run_test "Build process" "npm run build"
run_test "Unit tests" "npm test -- --passWithNoTests --silent"

echo ""
echo "📊 Test Results Summary:"
echo "========================"
echo -e "✅ Passed: ${GREEN}$PASSED${NC}"
echo -e "❌ Failed: ${RED}$FAILED${NC}"

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED * 100) / TOTAL ))
    echo -e "📈 Success Rate: $SUCCESS_RATE%"
fi

echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}⚠️  Some automated tests failed. Please fix before proceeding.${NC}"
    exit 1
else
    echo -e "${GREEN}🎉 All automated tests passed!${NC}"
    echo ""
    echo "📋 Next steps - Manual verification needed:"
    echo "===========================================" 
    echo "1. 🔐 Test authentication (parent/child login)"
    echo "2. 🛣️  Test route redirects (/chat, /chats → /)"
    echo "3. 💬 Test chat functionality (new conversation, send message)"
    echo "4. 👨‍👩‍👧‍👦 Test parent dashboard access and features"
    echo "5. 🎨 Test theme switching and UI responsiveness"
    echo ""
    echo "For complete checklist: src/test/test-checklist.md"
    echo ""
    echo -e "${GREEN}✨ Ready for manual testing!${NC}"
fi