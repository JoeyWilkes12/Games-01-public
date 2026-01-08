#!/bin/bash
#
# Game Hub - Test Runner Script
# Runs all Playwright tests and generates a consolidated report
#
# Usage: ./run-all-tests.sh [options]
#
# Options:
#   --demo     Run only the demo recording
#   --tests    Run only unit/seeded tests
#   --all      Run everything (default)
#   --report   Open the report after tests complete
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
RUN_DEMO=false
RUN_TESTS=false
OPEN_REPORT=false

for arg in "$@"; do
    case $arg in
        --demo)
            RUN_DEMO=true
            ;;
        --tests)
            RUN_TESTS=true
            ;;
        --all)
            RUN_DEMO=true
            RUN_TESTS=true
            ;;
        --report)
            OPEN_REPORT=true
            ;;
        *)
            ;;
    esac
done

# Default to running all tests if no specific option given
if [ "$RUN_DEMO" = false ] && [ "$RUN_TESTS" = false ]; then
    RUN_DEMO=true
    RUN_TESTS=true
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Game Hub - Automated Test Runner${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Track results
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test and track results
run_test() {
    local name=$1
    local command=$2
    
    ((TOTAL_TESTS++))
    echo -e "${YELLOW}▶ Running: ${name}${NC}"
    echo "  Command: $command"
    echo ""
    
    if eval "$command"; then
        echo -e "${GREEN}✓ PASSED: ${name}${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED: ${name}${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Run unit/seeded tests
if [ "$RUN_TESTS" = true ]; then
    echo -e "${BLUE}--- Unit & Seeded Tests ---${NC}"
    echo ""
    
    # Random Event Dice seeded tests
    run_test "Random Event Dice - Seeded Tests" \
        "npx playwright test apps/games/Random\\ Event\\ Dice/seeded-tests.spec.js --project=tests --reporter=list"
    
    # Bank seeded tests
    run_test "Bank - Seeded Tests" \
        "npx playwright test apps/games/Bank/seeded-tests.spec.js --project=tests --reporter=list"
fi

# Run demo recording
if [ "$RUN_DEMO" = true ]; then
    echo -e "${BLUE}--- Demo Recording ---${NC}"
    echo ""
    
    run_test "Demo Recording" \
        "npx playwright test --project=demo --reporter=list"
fi

# Summary
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Test Summary${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "Total:  ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
if [ "$TESTS_FAILED" -gt 0 ]; then
    echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
else
    echo -e "Failed: ${TESTS_FAILED}"
fi
echo ""

# Open report if requested or available
if [ "$OPEN_REPORT" = true ] || [ "$TESTS_FAILED" -gt 0 ]; then
    echo -e "${YELLOW}Opening test report...${NC}"
    npx playwright show-report &
fi

# Final status
echo ""
if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "View detailed report: npx playwright show-report"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Review the report for details.${NC}"
    echo ""
    echo "View detailed report: npx playwright show-report"
    exit 1
fi
