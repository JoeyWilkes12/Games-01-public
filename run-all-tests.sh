#!/bin/bash
#
# Game Hub - Test Runner Script
# Runs all Playwright tests and generates a consolidated report
#
# Usage: ./run-all-tests.sh [options]
#
# Options:
#   --demo     Run only the full demo recording (sequential, long)
#   --split    Run split demo tests (parallel capable, faster)
#   --tests    Run only unit/seeded tests
#   --all      Run everything (demo + split + tests)
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
NC='\033[0m' # No Color

# Parse arguments
RUN_DEMO=false
RUN_SPLIT=false
RUN_TESTS=false
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
        --all)
            RUN_DEMO=true
            RUN_TESTS=true
            RUN_SPLIT=true
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

# Default to running tests + split (faster) if no option given
if [ "$RUN_DEMO" = false ] && [ "$RUN_TESTS" = false ] && [ "$RUN_SPLIT" = false ]; then
    RUN_TESTS=true
    RUN_SPLIT=true
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Game Hub - Automated Test Runner${NC}"
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

# Function to run a test and track results
run_test() {
    local name=$1
    local command=$2
    
    ((TOTAL_TESTS++)) || true
    echo -e "${YELLOW}▶ Running: ${name}${NC}"
    echo "  Command: $command"
    echo ""
    
    set +e
    eval "$command"
    local result=$?
    set -e
    
    if [ $result -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED: ${name}${NC}"
        ((TESTS_PASSED++)) || true
    else
        echo -e "${RED}✗ FAILED: ${name}${NC}"
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

# Run React Migration Tests (primary)
if [ "$RUN_TESTS" = true ]; then
    echo -e "${BLUE}--- React Migration Tests ---${NC}"
    echo ""
    
    # React navigation and functionality tests
    run_test "React Migration Tests" \
        "npx playwright test tests/react-migration.spec.js --project=react-tests --reporter=list $HEADED_FLAG"
    
    # Mobile responsiveness tests
    run_test "Mobile Responsiveness Tests" \
        "npx playwright test tests/react-migration.spec.js --project=mobile-tests --reporter=list --grep='Mobile' $HEADED_FLAG"
fi

# Run Split Demo Tests (parallel)
if [ "$RUN_SPLIT" = true ]; then
    echo -e "${BLUE}--- Split Demo Tests (Parallel) ---${NC}"
    echo ""
    
    run_test "Split Game Demos" \
        "$SPEED_ENV npx playwright test tests/ --project=split-demos --reporter=list $HEADED_FLAG"
fi

# Run Full Demo Recording (sequential, long)
if [ "$RUN_DEMO" = true ]; then
    echo -e "${BLUE}--- Full Demo Recording ---${NC}"
    echo ""
    
    run_test "Full Demo Recording" \
        "$SPEED_ENV npx playwright test demo-recording.spec.js --project=demo --reporter=list $HEADED_FLAG"
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

# Open report if requested
if [ "$OPEN_REPORT" = true ]; then
    echo -e "${YELLOW}Opening test report...${NC}"
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
