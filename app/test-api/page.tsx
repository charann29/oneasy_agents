/**
 * Interactive API Testing Page
 * Visit: http://localhost:3000/test-api
 */

'use client';

import { useState } from 'react';

const API_KEY = 'demo-api-key-12345';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  response?: any;
  error?: string;
  duration?: number;
}

export default function TestAPIPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateResult = (index: number, update: Partial<TestResult>) => {
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], ...update };
      return newResults;
    });
  };

  const runTest = async (
    name: string,
    method: 'GET' | 'POST',
    endpoint: string,
    data?: any
  ): Promise<{ success: boolean; planId?: string }> => {
    const index = results.length;
    setResults(prev => [...prev, { name, status: 'pending' }]);

    const startTime = Date.now();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, options);
      const duration = Date.now() - startTime;
      const result = await response.json();

      if (response.ok) {
        updateResult(index, {
          status: 'success',
          statusCode: response.status,
          response: result,
          duration
        });
        return { success: true, planId: result.data?.planId };
      } else {
        updateResult(index, {
          status: 'error',
          statusCode: response.status,
          response: result,
          duration
        });
        return { success: false };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateResult(index, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      return { success: false };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    // Test 1: Create Business Plan
    const createResult = await runTest(
      '1. Create Business Plan',
      'POST',
      '/api/v1/business-plan/create',
      {
        businessName: 'TechStartup AI',
        industry: 'SaaS',
        stage: 'startup',
        targetMarket: 'Small businesses',
        location: 'San Francisco, CA',
        description: 'AI-powered automation'
      }
    );

    // Test 2: List Business Plans
    await runTest(
      '2. List Business Plans',
      'GET',
      '/api/v1/business-plan/list?limit=10&offset=0'
    );

    // Test 3: Get Specific Plan (if created)
    if (createResult.planId) {
      await runTest(
        '3. Get Business Plan by ID',
        'GET',
        `/api/v1/business-plan/${createResult.planId}`
      );
    }

    // Test 4: Market Analysis
    await runTest(
      '4. Market Analysis',
      'POST',
      '/api/v1/market-analysis',
      {
        industry: 'SaaS',
        geography: 'United States',
        targetSegment: 'Small businesses'
      }
    );

    // Test 5: Financial Model
    await runTest(
      '5. Financial Model',
      'POST',
      '/api/v1/financial-model',
      {
        businessName: 'TechStartup AI',
        industry: 'SaaS',
        stage: 'startup'
      }
    );

    setTesting(false);
  };

  const passed = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;
  const pending = results.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="border-b pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🧪 API Testing Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Test all Business Planner API endpoints
            </p>
          </div>

          {/* API Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">API Configuration</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Base URL:</span> {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}</p>
              <p><span className="font-medium">API Key:</span> {API_KEY}</p>
              <p className="text-blue-700 mt-2">
                ℹ️ Using demo API key for testing
              </p>
            </div>
          </div>

          {/* Run Tests Button */}
          <div className="mb-6">
            <button
              onClick={runAllTests}
              disabled={testing}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? '🔄 Running Tests...' : '▶️ Run All Tests'}
            </button>

            {results.length > 0 && (
              <div className="inline-flex gap-4 ml-4">
                <span className="text-green-600 font-semibold">
                  ✓ Passed: {passed}
                </span>
                <span className="text-red-600 font-semibold">
                  ✗ Failed: {failed}
                </span>
                {pending > 0 && (
                  <span className="text-yellow-600 font-semibold">
                    ⏳ Pending: {pending}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${result.status === 'success'
                    ? 'border-green-300 bg-green-50'
                    : result.status === 'error'
                      ? 'border-red-300 bg-red-50'
                      : 'border-yellow-300 bg-yellow-50'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">
                    {result.status === 'success' && '✅ '}
                    {result.status === 'error' && '❌ '}
                    {result.status === 'pending' && '⏳ '}
                    {result.name}
                  </h3>
                  <div className="flex items-center gap-4">
                    {result.statusCode && (
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${result.statusCode >= 200 && result.statusCode < 300
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                          }`}
                      >
                        {result.statusCode}
                      </span>
                    )}
                    {result.duration && (
                      <span className="text-sm text-gray-600">
                        {result.duration}ms
                      </span>
                    )}
                  </div>
                </div>

                {result.error && (
                  <div className="text-red-700 text-sm mb-2">
                    Error: {result.error}
                  </div>
                )}

                {result.response && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      View Response
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.response, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {results.length === 0 && !testing && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No tests run yet</p>
              <p className="text-sm mt-2">Click "Run All Tests" to begin</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">💡 What This Tests</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• <strong>Create Business Plan:</strong> Full business plan generation with AI agents</li>
              <li>• <strong>List Plans:</strong> Retrieve all business plans for the user</li>
              <li>• <strong>Get Plan by ID:</strong> Fetch specific business plan details</li>
              <li>• <strong>Market Analysis:</strong> Run market sizing and analysis</li>
              <li>• <strong>Financial Model:</strong> Generate 7-year financial projections</li>
            </ul>
          </div>

          {/* Manual Testing */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">🔧 Manual Testing with cURL</h3>
            <div className="text-sm space-y-2">
              <p className="text-purple-800">Copy and paste in terminal:</p>
              <pre className="p-2 bg-purple-900 text-purple-100 rounded text-xs overflow-x-auto">
                {`curl -X POST http://localhost:3000/api/v1/business-plan/create \\
  -H "Authorization: Bearer demo-api-key-12345" \\
  -H "Content-Type: application/json" \\
  -d '{"businessName":"Test","industry":"SaaS","stage":"startup","targetMarket":"SMBs","location":"SF"}'`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
