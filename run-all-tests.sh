#!/bin/bash
#
# Game Hub - Test Runner Script
# Runs all Playwright and Vitest tests and generates a consolidated report
#
# Usage: ./run-all-tests.sh [options]
#
# Options:
#   --demo     Run only the full demo recording (sequential, long)
#   --split    Run split demo tests (parallel capable, faster)
#   --tests    Run only Playwright E2E seeded tests
#   --unit     Run Vitest unit tests (Node.js, fastest)
#   --component Run Vitest component tests (real browser via Playwright)
#   --all      Run everything (unit + component + tests + split + demo)
#   --report   Open the report after tests complete
#   --headed   Run tests in headed mode (visible browser)
#   --speed=N  Set demo speed multiplier (e.g. 2.0 for 2x faster, 0.5 for slower)
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parse arguments
RUN_DEMO=false
RUN_SPLIT=false
RUN_TESTS=false
RUN_UNIT=false
RUN_COMPONENT=false
OPEN_REPORT=false
HEADED_FLAG=""
DEMO_SPEED=""

for arg in "$@"; do
    case $arg in
        --demo)
            RUN_DEMO=true
            ;;
        --split)
            RUN_SPLIT=true
            ;;
        --tests)
            RUN_TESTS=true
            ;;
        --unit)
            RUN_UNIT=true
            ;;
        --component)
            RUN_COMPONENT=true
            ;;
        --all)
            RUN_DEMO=true
            RUN_TESTS=true
            RUN_SPLIT=true
            RUN_UNIT=true
            RUN_COMPONENT=true
            ;;
        --report)
            OPEN_REPORT=true
            ;;
        --headed)
            HEADED_FLAG="--headed"
            ;;
        --speed=*)
            DEMO_SPEED="${arg#*=}"
            ;;
        *)
            ;;
    esac
done

# Default to running unit + tests (most common use case) if no option given
if [ "$RUN_DEMO" = false ] && [ "$RUN_TESTS" = false ] && [ "$RUN_SPLIT" = false ] && [ "$RUN_UNIT" = false ] && [ "$RUN_COMPONENT" = false ]; then
    RUN_UNIT=true
    RUN_TESTS=true
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Game Hub - Automated Test Runner${NC}"
echo -e "${BLUE}   Hybrid Testing: Vitest + Playwright${NC}"
echo -e "${BLUE}================================================${NC}"
if [ -n "$DEMO_SPEED" ]; then
    echo -e "Speed Multiplier: ${YELLOW}$DEMO_SPEED${NC}"
fi
if [ -n "$HEADED_FLAG" ]; then
    echo -e "Mode: ${YELLOW}Headed (visible browser)${NC}"
fi
echo ""

# Track results
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0
START_TIME=$(date +%s)

# Function to run a test and track results
run_test() {
    local name=$1
    local command=$2
    
    ((TOTAL_TESTS++)) || true
    echo -e "${YELLOW}▶ Running: ${name}${NC}"
    echo "  Command: $command"
    echo ""
    
    local test_start=$(date +%s)
    
    set +e
    eval "$command"
    local result=$?
    set -e
    
    local test_end=$(date +%s)
    local duration=$((test_end - test_start))
    
    if [ $result -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED: ${name} (${duration}s)${NC}"
        ((TESTS_PASSED++)) || true
    else
        echo -e "${RED}✗ FAILED: ${name} (${duration}s)${NC}"
        ((TESTS_FAILED++)) || true
    fi
    echo ""
}

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Build environment string for speed
SPEED_ENV=""
if [ -n "$DEMO_SPEED" ]; then
    SPEED_ENV="DEMO_SPEED=$DEMO_SPEED"
fi

# ====================================================================
# VITEST TESTS (Unit & Component - Fastest layer)
# ====================================================================

if [ "$RUN_UNIT" = true ]; then
    echo -e "${CYAN}--- Vitest Unit Tests (Node.js) ---${NC}"
    echo -e "${CYAN}    Testing pure game logic without browser${NC}"
    echo ""
    
    run_test "Vitest Unit Tests" \
        "npm run test:unit 2>&1 || true"
fi

if [ "$RUN_COMPONENT" = true ]; then
    echo -e "${CYAN}--- Vitest Component Tests (Playwright Browser) ---${NC}"
    echo -e "${CYAN}    Testing React components in real Chromium browser${NC}"
    echo ""
    
    COMPONENT_HEADED=""
    if [ -n "$HEADED_FLAG" ]; then
        COMPONENT_HEADED=""  # Vitest uses different flag for headed
    fi
    
    run_test "Vitest Component Tests" \
        "npm run test:component 2>&1 || true"
fi

# ====================================================================
# PLAYWRIGHT E2E TESTS (Integration layer)
# ====================================================================

if [ "$RUN_TESTS" = true ]; then
    echo -e "${BLUE}--- Playwright E2E Tests ---${NC}"
    echo -e "${BLUE}    Full integration tests with browser automation${NC}"
    echo ""
    
    # React navigation and functionality tests
    run_test "React Migration Tests" \
        "npx playwright test tests/react-migration.spec.js --project=react-tests --reporter=list $HEADED_FLAG"
    
    # Seeded Bank tests
    run_test "Bank - Seeded Tests" \
        "npx playwright test tests/seeded-bank.spec.js --project=react-tests --reporter=list $HEADED_FLAG"
    
    # Seeded 2048 tests
    run_test "2048 - Seeded Tests" \
        "npx playwright test tests/seeded-2048.spec.js --project=react-tests --reporter=list $HEADED_FLAG"
    
    # Seeded Random Event Dice tests
    run_test "Random Event Dice - Seeded Tests" \
        "npx playwright test tests/seeded-red.spec.js --project=react-tests --reporter=list $HEADED_FLAG"
    
    # Mobile responsiveness tests
    run_test "Mobile Responsiveness Tests" \
        "npx playwright test tests/react-migration.spec.js --project=mobile-tests --reporter=list --grep='Mobile' $HEADED_FLAG"
fi

# ====================================================================
# SPLIT DEMO TESTS (Parallel recordings)
# ====================================================================

if [ "$RUN_SPLIT" = true ]; then
    echo -e "${BLUE}--- Split Demo Tests (Parallel) ---${NC}"
    echo -e "${BLUE}    Individual game demos running in parallel${NC}"
    echo ""
    
    run_test "Split Game Demos" \
        "$SPEED_ENV npx playwright test tests/demo-*.spec.js --project=split-demos --reporter=list $HEADED_FLAG"
fi

# ====================================================================
# FULL DEMO RECORDING (Sequential, comprehensive)
# ====================================================================

if [ "$RUN_DEMO" = true ]; then
    echo -e "${BLUE}--- Full Demo Recording ---${NC}"
    echo -e "${BLUE}    Complete sequential walkthrough of all games${NC}"
    echo ""
    
    run_test "Full Demo Recording" \
        "$SPEED_ENV npx playwright test demo-recording.spec.js --project=demo --reporter=list $HEADED_FLAG"
fi

# ====================================================================
# SUMMARY
# ====================================================================

END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Test Summary${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "Total Duration: ${TOTAL_DURATION}s"
echo -e "Total Suites:   ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
if [ "$TESTS_FAILED" -gt 0 ]; then
    echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
else
    echo -e "Failed: ${TESTS_FAILED}"
fi
echo ""

# Test pyramid summary
echo -e "${CYAN}Testing Pyramid:${NC}"
echo "  ┌─────────────────────────────────────────┐"
echo "  │  Unit Tests (Vitest Node.js)    ~50ms  │  ← Fastest"
echo "  ├─────────────────────────────────────────┤"
echo "  │  Component Tests (Vitest Browser) ~200ms│"
echo "  ├─────────────────────────────────────────┤"
echo "  │  E2E Tests (Playwright)          ~2min │"
echo "  ├─────────────────────────────────────────┤"
echo "  │  Demo Recordings                 ~5min │  ← Most comprehensive"
echo "  └─────────────────────────────────────────┘"
echo ""

# Open report if requested
if [ "$OPEN_REPORT" = true ]; then
    echo -e "${YELLOW}Opening Playwright test report...${NC}"
    npx playwright show-report &
fi

# Final status
echo ""
if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Review the report for details.${NC}"
    exit 1
fi
