/**
 * API Testing Script (Node.js)
 * Run with: node test-api.js
 */

const BASE_URL = 'http://localhost:3000';
const API_KEY = 'demo-api-key-12345';

let testsPassed = 0;
let testsFailed = 0;
let createdPlanId = null;

// Color codes for console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function testEndpoint(name, method, endpoint, data = null) {
  console.log(`${colors.blue}Testing: ${name}${colors.reset}`);
  console.log(`Endpoint: ${method} ${endpoint}`);

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const statusCode = response.status;
    const body = await response.json();

    console.log(`Status Code: ${statusCode}`);

    if (statusCode >= 200 && statusCode < 300) {
      console.log(`${colors.green}✓ PASSED${colors.reset}`);
      testsPassed++;
      console.log('Response:');
      console.log(JSON.stringify(body, null, 2));

      // Store plan ID if this was a create request
      if (body.data && body.data.planId) {
        createdPlanId = body.data.planId;
      }
    } else {
      console.log(`${colors.red}✗ FAILED${colors.reset}`);
      testsFailed++;
      console.log('Response:');
      console.log(JSON.stringify(body, null, 2));
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAILED (Error: ${error.message})${colors.reset}`);
    testsFailed++;
  }

  console.log('');
  console.log('----------------------------------------');
  console.log('');
}

async function runTests() {
  console.log('🚀 Business Planner API Testing Script');
  console.log('========================================');
  console.log('');

  // Check if server is running
  console.log('Checking if server is running...');
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      console.log(`${colors.green}✓ Server is running${colors.reset}`);
    } else {
      throw new Error('Server responded with error');
    }
  } catch (error) {
    console.log(`${colors.red}Error: Server is not running at ${BASE_URL}${colors.reset}`);
    console.log('Please start the server with: npm run dev');
    process.exit(1);
  }

  console.log('');
  console.log('----------------------------------------');
  console.log('');

  // Test 1: Create Business Plan
  await testEndpoint(
    'Create Business Plan',
    'POST',
    '/api/v1/business-plan/create',
    {
      businessName: 'TechStartup AI',
      industry: 'SaaS',
      stage: 'startup',
      targetMarket: 'Small businesses in North America',
      location: 'San Francisco, CA',
      description: 'AI-powered business automation platform',
      revenue: '$50,000 MRR',
      teamSize: 5,
      fundingGoal: 2000000
    }
  );

  // Test 2: List Business Plans
  await testEndpoint(
    'List Business Plans',
    'GET',
    '/api/v1/business-plan/list?limit=10&offset=0'
  );

  // Test 3: Get Specific Business Plan (if we have a plan ID)
  if (createdPlanId) {
    await testEndpoint(
      'Get Business Plan by ID',
      'GET',
      `/api/v1/business-plan/${createdPlanId}`
    );
  } else {
    console.log(`${colors.blue}Skipping Get Business Plan by ID (no plan created)${colors.reset}`);
    console.log('');
  }

  // Test 4: Market Analysis
  await testEndpoint(
    'Market Analysis',
    'POST',
    '/api/v1/market-analysis',
    {
      industry: 'SaaS',
      geography: 'United States',
      targetSegment: 'Small businesses with 10-50 employees'
    }
  );

  // Test 5: Financial Model
  await testEndpoint(
    'Generate Financial Model',
    'POST',
    '/api/v1/financial-model',
    {
      businessName: 'TechStartup AI',
      industry: 'SaaS',
      stage: 'startup'
    }
  );

  // Test 6: Test without authentication (should fail)
  console.log(`${colors.blue}Testing: Unauthorized Request (should fail)${colors.reset}`);
  console.log('Endpoint: POST /api/v1/business-plan/create');
  try {
    const response = await fetch(`${BASE_URL}/api/v1/business-plan/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ businessName: 'Test' })
    });

    const statusCode = response.status;
    console.log(`Status Code: ${statusCode}`);

    if (statusCode === 401) {
      console.log(`${colors.green}✓ PASSED (correctly rejected)${colors.reset}`);
      testsPassed++;
    } else {
      console.log(`${colors.red}✗ FAILED (should have returned 401)${colors.reset}`);
      testsFailed++;
    }

    const body = await response.json();
    console.log('Response:');
    console.log(JSON.stringify(body, null, 2));
  } catch (error) {
    console.log(`${colors.red}✗ FAILED (Error: ${error.message})${colors.reset}`);
    testsFailed++;
  }

  console.log('');
  console.log('----------------------------------------');
  console.log('');

  // Test 7: Rate Limiting
  console.log(`${colors.blue}Testing: Rate Limiting${colors.reset}`);
  console.log('Making 12 rapid requests to trigger rate limit...');

  for (let i = 1; i <= 12; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/business-plan/list`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      if (response.status === 429) {
        console.log(`${colors.green}✓ Rate limit triggered on request ${i}${colors.reset}`);
        testsPassed++;
        break;
      } else if (i === 12) {
        console.log(`${colors.red}✗ Rate limit not triggered after 12 requests${colors.reset}`);
        testsFailed++;
      }
    } catch (error) {
      console.log(`${colors.red}✗ Request ${i} failed: ${error.message}${colors.reset}`);
    }
  }

  console.log('');
  console.log('----------------------------------------');
  console.log('');

  // Summary
  console.log('========================================');
  console.log('📊 Test Summary');
  console.log('========================================');
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log('');

  if (testsFailed === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ Some tests failed${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
