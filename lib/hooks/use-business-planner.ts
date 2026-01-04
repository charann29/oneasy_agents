/**
 * React Hooks for Business Planner API
 * Frontend service layer for API interactions
 */

'use client';

import { useState } from 'react';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'demo-api-key-12345'; // Demo key

export interface BusinessPlanRequest {
  businessName: string;
  industry: string;
  stage: 'idea' | 'startup' | 'growing' | 'established';
  targetMarket: string;
  location: string;
  description?: string;
  revenue?: string;
  teamSize?: number;
  fundingGoal?: number;
}

export interface BusinessPlanResult {
  planId: string;
  sessionId: string;
  synthesis: string;
  metrics: {
    executionTime: number;
    agentsUsed: number;
    skillsExecuted: string[];
  };
  createdAt: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

/**
 * Hook for creating business plans
 */
export function useCreateBusinessPlan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BusinessPlanResult | null>(null);

  const createPlan = async (request: BusinessPlanRequest) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/business-plan/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to create business plan');
      }

      setData(result.data);
      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createPlan, loading, error, data };
}

/**
 * Hook for fetching business plans
 */
export function useGetBusinessPlan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  const getPlan = async (planId: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/business-plan/${planId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to fetch business plan');
      }

      setData(result.data);
      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getPlan, loading, error, data };
}

/**
 * Hook for listing business plans
 */
export function useListBusinessPlans() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  const listPlans = async (limit = 10, offset = 0) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/business-plan/list?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to list business plans');
      }

      setData(result.data);
      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { listPlans, loading, error, data };
}

/**
 * Hook for market analysis
 */
export function useMarketAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  const analyzeMarket = async (industry: string, geography: string, targetSegment: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/market-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ industry, geography, targetSegment })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to run market analysis');
      }

      setData(result.data);
      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeMarket, loading, error, data };
}

/**
 * Hook for financial modeling
 */
export function useFinancialModel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  const generateModel = async (businessData: any) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/financial-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(businessData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to generate financial model');
      }

      setData(result.data);
      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateModel, loading, error, data };
}

/**
 * Direct API call functions (for non-hook usage)
 */
export const BusinessPlannerAPI = {
  async createBusinessPlan(request: BusinessPlanRequest): Promise<BusinessPlanResult> {
    const response = await fetch(`${API_BASE_URL}/api/v1/business-plan/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(request)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Failed to create business plan');
    }

    return result.data;
  },

  async getBusinessPlan(planId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/v1/business-plan/${planId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Failed to fetch business plan');
    }

    return result.data;
  },

  async listBusinessPlans(limit = 10, offset = 0): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/business-plan/list?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Failed to list business plans');
    }

    return result.data;
  },

  async analyzeMarket(industry: string, geography: string, targetSegment: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/v1/market-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ industry, geography, targetSegment })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Failed to run market analysis');
    }

    return result.data;
  },

  async generateFinancialModel(businessData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/v1/financial-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(businessData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Failed to generate financial model');
    }

    return result.data;
  }
};
