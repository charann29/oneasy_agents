/**
 * Example Component: Using Business Planner API
 * Demonstrates how to use the React hooks for business planning
 */

'use client';

import { useState } from 'react';
import {
  useCreateBusinessPlan,
  useGetBusinessPlan,
  useListBusinessPlans,
  useMarketAnalysis,
  useFinancialModel
} from '@/lib/hooks/use-business-planner';

export default function BusinessPlannerExample() {
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'market' | 'financial'>('create');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Business Planner API Examples</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'create'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          Create Business Plan
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'list'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          List Plans
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'market'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          Market Analysis
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'financial'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          Financial Model
        </button>
      </div>

      {/* Content */}
      {activeTab === 'create' && <CreateBusinessPlanExample />}
      {activeTab === 'list' && <ListBusinessPlansExample />}
      {activeTab === 'market' && <MarketAnalysisExample />}
      {activeTab === 'financial' && <FinancialModelExample />}
    </div>
  );
}

/**
 * Example 1: Create Business Plan
 */
function CreateBusinessPlanExample() {
  const { createPlan, loading, error, data } = useCreateBusinessPlan();
  const [formData, setFormData] = useState({
    businessName: 'TechStartup AI',
    industry: 'SaaS',
    stage: 'startup' as const,
    targetMarket: 'Small businesses',
    location: 'San Francisco, CA',
    description: 'AI-powered business automation platform',
    revenue: '$50,000 MRR',
    teamSize: 5,
    fundingGoal: 2000000
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlan(formData);
    } catch (err) {
      console.error('Failed to create plan:', err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Create Business Plan</h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stage</label>
          <select
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="idea">Idea</option>
            <option value="startup">Startup</option>
            <option value="growing">Growing</option>
            <option value="established">Established</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Market</label>
          <input
            type="text"
            value={formData.targetMarket}
            onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating Plan...' : 'Create Business Plan'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Success */}
      {data && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium mb-2">Business Plan Created!</p>
          <p className="text-sm text-gray-600">Plan ID: {data.planId}</p>
          <p className="text-sm text-gray-600">Session ID: {data.sessionId}</p>
          <p className="text-sm text-gray-600">Agents Used: {data.metrics.agentsUsed}</p>
          <p className="text-sm text-gray-600">Skills: {data.metrics.skillsExecuted.join(', ')}</p>
          <div className="mt-4">
            <p className="font-medium mb-2">Synthesis:</p>
            <p className="text-sm whitespace-pre-wrap">{data.synthesis.substring(0, 500)}...</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: List Business Plans
 */
function ListBusinessPlansExample() {
  const { listPlans, loading, error, data } = useListBusinessPlans();

  const handleList = async () => {
    try {
      await listPlans(10, 0);
    } catch (err) {
      console.error('Failed to list plans:', err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">List Business Plans</h2>

      <button
        onClick={handleList}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load My Plans'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="mt-4 space-y-4">
          {data.map((plan: any) => (
            <div key={plan.id} className="p-4 border rounded-md">
              <h3 className="font-semibold text-lg">{plan.businessName}</h3>
              <p className="text-sm text-gray-600">Industry: {plan.industry}</p>
              <p className="text-sm text-gray-600">Created: {new Date(plan.createdAt).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Status: {plan.status}</p>
            </div>
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <p className="mt-4 text-gray-600">No business plans found.</p>
      )}
    </div>
  );
}

/**
 * Example 3: Market Analysis
 */
function MarketAnalysisExample() {
  const { analyzeMarket, loading, error, data } = useMarketAnalysis();
  const [industry, setIndustry] = useState('SaaS');
  const [geography, setGeography] = useState('United States');
  const [segment, setSegment] = useState('Small businesses');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await analyzeMarket(industry, geography, segment);
    } catch (err) {
      console.error('Failed to analyze market:', err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Market Analysis</h2>

      <form onSubmit={handleAnalyze} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Geography</label>
          <input
            type="text"
            value={geography}
            onChange={(e) => setGeography(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Segment</label>
          <input
            type="text"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {data && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium mb-2">Market Analysis Complete!</p>
          <p className="text-sm text-gray-600">Session ID: {data.sessionId}</p>
          <div className="mt-4">
            <p className="font-medium mb-2">Analysis:</p>
            <p className="text-sm whitespace-pre-wrap">{data.analysis.substring(0, 500)}...</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Financial Model
 */
function FinancialModelExample() {
  const { generateModel, loading, error, data } = useFinancialModel();
  const [businessData, setBusinessData] = useState({
    businessName: 'TechStartup AI',
    industry: 'SaaS',
    stage: 'startup'
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generateModel(businessData);
    } catch (err) {
      console.error('Failed to generate model:', err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Financial Model Generator</h2>

      <form onSubmit={handleGenerate} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <input
            type="text"
            value={businessData.businessName}
            onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <input
            type="text"
            value={businessData.industry}
            onChange={(e) => setBusinessData({ ...businessData, industry: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating Model...' : 'Generate Financial Model'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {data && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium mb-2">Financial Model Generated!</p>
          <p className="text-sm text-gray-600">Session ID: {data.sessionId}</p>
          <div className="mt-4">
            <p className="font-medium mb-2">Model:</p>
            <p className="text-sm whitespace-pre-wrap">{data.financialModel.substring(0, 500)}...</p>
          </div>
        </div>
      )}
    </div>
  );
}
