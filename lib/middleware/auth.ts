/**
 * Authentication Middleware
 * Simple token-based authentication for API routes
 */

import { NextRequest } from 'next/server';
import { logger } from '@/backend/utils/logger';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

// In-memory user store (replace with real database in production)
const users = new Map<string, AuthUser>();
const apiKeys = new Map<string, string>(); // apiKey -> userId

/**
 * Initialize with a demo user for development
 */
export function initializeDemoUsers() {
  const demoUserId = 'demo-user-123';
  const demoApiKey = 'demo-api-key-12345'; // Change this in production!

  users.set(demoUserId, {
    id: demoUserId,
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'user'
  });

  apiKeys.set(demoApiKey, demoUserId);

  logger.info('Demo user initialized', { userId: demoUserId });
}

/**
 * Authenticate request using Bearer token
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return null;
    }

    // Parse Bearer token
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return null;
    }

    const apiKey = match[1];

    // Look up user by API key
    const userId = apiKeys.get(apiKey);
    if (!userId) {
      logger.warn('Invalid API key', { apiKey: apiKey.substring(0, 10) });
      return null;
    }

    const user = users.get(userId);
    if (!user) {
      logger.warn('User not found for API key', { userId });
      return null;
    }

    logger.info('Request authenticated', { userId: user.id, email: user.email });
    return user;

  } catch (error) {
    logger.error('Authentication error', error);
    return null;
  }
}

/**
 * Create a new user and API key
 */
export async function createUser(email: string, name?: string): Promise<{ user: AuthUser; apiKey: string }> {
  const userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const apiKey = `key-${Date.now()}-${Math.random().toString(36).substring(2)}`;

  const user: AuthUser = {
    id: userId,
    email,
    name,
    role: 'user'
  };

  users.set(userId, user);
  apiKeys.set(apiKey, userId);

  logger.info('User created', { userId, email });

  return { user, apiKey };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  return users.get(userId) || null;
}

/**
 * Verify user has access to resource
 */
export function authorizeUser(user: AuthUser, resourceUserId: string): boolean {
  // Users can only access their own resources
  if (user.role === 'admin') {
    return true;
  }

  return user.id === resourceUserId;
}

// Initialize demo users on import
initializeDemoUsers();
