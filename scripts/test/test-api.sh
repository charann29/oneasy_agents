#!/bin/bash

# API Testing Script for Business Planner
# This script tests all API endpoints

BASE_URL="http://localhost:3000"
API_KEY="demo-api-key-12345"

echo "🚀 Business Planner API Testing Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4

    echo -e "${BLUE}Testing: $name${NC}"
    echo "Endpoint: $method $endpoint"

    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $API_KEY")
    fi

    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract body (everything except last line)
    body=$(echo "$response" | sed '$d')

    echo "Status Code: $status_code"

    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "Response:"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "Response:"
        echo "$body"
    fi

    echo ""
    echo "----------------------------------------"
    echo ""
}

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}Error: Server is not running at $BASE_URL${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""
echo "----------------------------------------"
echo ""

# Test 1: Create Business Plan
test_endpoint \
    "Create Business Plan" \
    "POST" \
    "/api/v1/business-plan/create" \
    '{
        "businessName": "TechStartup AI",
        "industry": "SaaS",
        "stage": "startup",
        "targetMarket": "Small businesses in North America",
        "location": "San Francisco, CA",
        "description": "AI-powered business automation platform",
        "revenue": "$50,000 MRR",
        "teamSize": 5,
        "fundingGoal": 2000000
    }'

# Store the plan ID for later tests (extract from last response)
PLAN_ID=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['planId'])" 2>/dev/null)

# Test 2: List Business Plans
test_endpoint \
    "List Business Plans" \
    "GET" \
    "/api/v1/business-plan/list?limit=10&offset=0" \
    ""

# Test 3: Get Specific Business Plan (if we have a plan ID)
if [ -n "$PLAN_ID" ]; then
    test_endpoint \
        "Get Business Plan by ID" \
        "GET" \
        "/api/v1/business-plan/$PLAN_ID" \
        ""
else
    echo -e "${BLUE}Skipping Get Business Plan by ID (no plan created)${NC}"
    echo ""
fi

# Test 4: Market Analysis
test_endpoint \
    "Market Analysis" \
    "POST" \
    "/api/v1/market-analysis" \
    '{
        "industry": "SaaS",
        "geography": "United States",
        "targetSegment": "Small businesses with 10-50 employees"
    }'

# Test 5: Financial Model
test_endpoint \
    "Generate Financial Model" \
    "POST" \
    "/api/v1/financial-model" \
    '{
        "businessName": "TechStartup AI",
        "industry": "SaaS",
        "stage": "startup"
    }'

# Test 6: Test without authentication (should fail)
echo -e "${BLUE}Testing: Unauthorized Request (should fail)${NC}"
echo "Endpoint: POST /api/v1/business-plan/create"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/business-plan/create" \
    -H "Content-Type: application/json" \
    -d '{"businessName":"Test"}')
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "Status Code: $status_code"
if [ "$status_code" = "401" ]; then
    echo -e "${GREEN}✓ PASSED (correctly rejected)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED (should have returned 401)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo "Response:"
echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
echo ""
echo "----------------------------------------"
echo ""

# Test 7: Test rate limiting (multiple rapid requests)
echo -e "${BLUE}Testing: Rate Limiting${NC}"
echo "Making 12 rapid requests to trigger rate limit..."
for i in {1..12}; do
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/business-plan/list" \
        -H "Authorization: Bearer $API_KEY")
    if [ "$status_code" = "429" ]; then
        echo -e "${GREEN}✓ Rate limit triggered on request $i${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        break
    elif [ "$i" = "12" ]; then
        echo -e "${RED}✗ Rate limit not triggered after 12 requests${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
done
echo ""
echo "----------------------------------------"
echo ""

# Summary
echo "========================================"
echo "📊 Test Summary"
echo "========================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
