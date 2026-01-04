/**
 * Database Service
 * Abstracts database operations with support for MongoDB and Supabase
 */

import { logger } from '@/backend/utils/logger';

// Import database clients
let mongoClient: any = null;
let supabaseClient: any = null;

// Lazy load to avoid initialization errors
async function getMongoClient() {
  if (!mongoClient && process.env.MONGODB_URI) {
    const { MongoClient } = await import('mongodb');
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    logger.info('MongoDB connected');
  }
  return mongoClient;
}

async function getSupabaseClient() {
  if (!supabaseClient && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    logger.info('Supabase connected');
  }
  return supabaseClient;
}

export interface Session {
  id: string;
  userId: string;
  type: 'business_plan' | 'market_analysis' | 'financial_model';
  status: 'processing' | 'completed' | 'failed';
  input: any;
  error?: string;
  executionTimeMs?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface BusinessPlan {
  id: string;
  sessionId: string;
  userId: string;
  businessName: string;
  industry: string;
  synthesis: string;
  agentOutputs: any[];
  metrics: any;
  status: 'completed' | 'failed';
  createdAt: Date;
}

export interface ConversationState {
  conversationId: string;
  userId: string;
  phase: string;
  messages: any[];
  extractedData: Record<string, any>;
  progress: number;
  startedAt: number;
  lastActiveAt: number;
  completedAt?: number;
  linkedPlanId?: string;
}

export class DatabaseService {
  private dbType: 'mongodb' | 'supabase' | 'memory';
  private memoryStore!: Map<string, any>;

  constructor() {
    // Determine which database to use
    if (process.env.MONGODB_URI) {
      this.dbType = 'mongodb';
    } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      this.dbType = 'supabase';
    } else {
      this.dbType = 'memory';
      this.memoryStore = new Map();
      logger.warn('No database configured, using in-memory storage');
    }

    logger.info('Database service initialized', { type: this.dbType });
  }

  /**
   * Create session
   */
  async createSession(session: Session): Promise<string> {
    logger.info('Creating session', { sessionId: session.id, type: session.type });

    if (this.dbType === 'mongodb') {
      return await this.createSessionMongo(session);
    } else if (this.dbType === 'supabase') {
      return await this.createSessionSupabase(session);
    } else {
      return await this.createSessionMemory(session);
    }
  }

  /**
   * Update session
   */
  async updateSession(sessionId: string, updates: Partial<Session>): Promise<void> {
    logger.info('Updating session', { sessionId, updates: Object.keys(updates) });

    if (this.dbType === 'mongodb') {
      await this.updateSessionMongo(sessionId, updates);
    } else if (this.dbType === 'supabase') {
      await this.updateSessionSupabase(sessionId, updates);
    } else {
      await this.updateSessionMemory(sessionId, updates);
    }
  }

  /**
   * Get session
   */
  async getSession(sessionId: string): Promise<Session | null> {
    if (this.dbType === 'mongodb') {
      return await this.getSessionMongo(sessionId);
    } else if (this.dbType === 'supabase') {
      return await this.getSessionSupabase(sessionId);
    } else {
      return await this.getSessionMemory(sessionId);
    }
  }

  /**
   * Create business plan
   */
  async createBusinessPlan(plan: BusinessPlan): Promise<string> {
    logger.info('Creating business plan', { planId: plan.id, businessName: plan.businessName });

    if (this.dbType === 'mongodb') {
      return await this.createBusinessPlanMongo(plan);
    } else if (this.dbType === 'supabase') {
      return await this.createBusinessPlanSupabase(plan);
    } else {
      return await this.createBusinessPlanMemory(plan);
    }
  }

  /**
   * Get business plan
   */
  async getBusinessPlan(planId: string): Promise<BusinessPlan | null> {
    if (this.dbType === 'mongodb') {
      return await this.getBusinessPlanMongo(planId);
    } else if (this.dbType === 'supabase') {
      return await this.getBusinessPlanSupabase(planId);
    } else {
      return await this.getBusinessPlanMemory(planId);
    }
  }

  /**
   * List business plans for user
   */
  async listBusinessPlans(userId: string, limit = 10, offset = 0): Promise<BusinessPlan[]> {
    if (this.dbType === 'mongodb') {
      return await this.listBusinessPlansMongo(userId, limit, offset);
    } else if (this.dbType === 'supabase') {
      return await this.listBusinessPlansSupabase(userId, limit, offset);
    } else {
      return await this.listBusinessPlansMemory(userId, limit, offset);
    }
  }

  /**
   * MongoDB implementations
   */

  private async createSessionMongo(session: Session): Promise<string> {
    const client = await getMongoClient();
    const db = client.db('business_planner');
    await db.collection('sessions').insertOne(session);
    return session.id;
  }

  private async updateSessionMongo(sessionId: string, updates: Partial<Session>): Promise<void> {
    const client = await getMongoClient();
    const db = client.db('business_planner');
    await db.collection('sessions').updateOne(
      { id: sessionId },
      { $set: updates }
    );
  }

  private async getSessionMongo(sessionId: string): Promise<Session | null> {
    const client = await getMongoClient();
    const db = client.db('business_planner');
    return await db.collection('sessions').findOne({ id: sessionId }) as Session | null;
  }

  private async createBusinessPlanMongo(plan: BusinessPlan): Promise<string> {
    const client = await getMongoClient();
    const db = client.db('business_planner');
    await db.collection('business_plans').insertOne(plan);
    return plan.id;
  }

  private async getBusinessPlanMongo(planId: string): Promise<BusinessPlan | null> {
    const client = await getMongoClient();
    const db = client.db('business_planner');
    return await db.collection('business_plans').findOne({ id: planId }) as BusinessPlan | null;
  }

  private async listBusinessPlansMongo(userId: string, limit: number, offset: number): Promise<BusinessPlan[]> {
    const client = await getMongoClient();
    const db = client.db('business_planner');
    return await db.collection('business_plans')
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray() as BusinessPlan[];
  }

  /**
   * Supabase implementations
   */

  private async createSessionSupabase(session: Session): Promise<string> {
    const client = await getSupabaseClient();
    const { error } = await client.from('sessions').insert([session]);
    if (error) throw error;
    return session.id;
  }

  private async updateSessionSupabase(sessionId: string, updates: Partial<Session>): Promise<void> {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('sessions')
      .update(updates)
      .eq('id', sessionId);
    if (error) throw error;
  }

  private async getSessionSupabase(sessionId: string): Promise<Session | null> {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    if (error) return null;
    return data as Session;
  }

  private async createBusinessPlanSupabase(plan: BusinessPlan): Promise<string> {
    const client = await getSupabaseClient();
    const { error } = await client.from('business_plans').insert([plan]);
    if (error) throw error;
    return plan.id;
  }

  private async getBusinessPlanSupabase(planId: string): Promise<BusinessPlan | null> {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('business_plans')
      .select('*')
      .eq('id', planId)
      .single();
    if (error) return null;
    return data as BusinessPlan;
  }

  private async listBusinessPlansSupabase(userId: string, limit: number, offset: number): Promise<BusinessPlan[]> {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('business_plans')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data as BusinessPlan[];
  }

  /**
   * In-memory implementations (for development/testing)
   */

  private async createSessionMemory(session: Session): Promise<string> {
    this.memoryStore.set(`session:${session.id}`, session);
    return session.id;
  }

  private async updateSessionMemory(sessionId: string, updates: Partial<Session>): Promise<void> {
    const session = this.memoryStore.get(`session:${sessionId}`);
    if (session) {
      this.memoryStore.set(`session:${sessionId}`, { ...session, ...updates });
    }
  }

  private async getSessionMemory(sessionId: string): Promise<Session | null> {
    return this.memoryStore.get(`session:${sessionId}`) || null;
  }

  private async createBusinessPlanMemory(plan: BusinessPlan): Promise<string> {
    this.memoryStore.set(`plan:${plan.id}`, plan);

    // Also store in user index
    const userPlans = this.memoryStore.get(`user_plans:${plan.userId}`) || [];
    userPlans.push(plan.id);
    this.memoryStore.set(`user_plans:${plan.userId}`, userPlans);

    return plan.id;
  }

  private async getBusinessPlanMemory(planId: string): Promise<BusinessPlan | null> {
    return this.memoryStore.get(`plan:${planId}`) || null;
  }

  private async listBusinessPlansMemory(userId: string, limit: number, offset: number): Promise<BusinessPlan[]> {
    const planIds = this.memoryStore.get(`user_plans:${userId}`) || [];
    const plans = planIds
      .slice(offset, offset + limit)
      .map((id: string) => this.memoryStore.get(`plan:${id}`))
      .filter((plan: any) => plan !== undefined);
    return plans;
  }

  /**
   * Conversation Management
   */

  async saveConversation(state: ConversationState): Promise<void> {
    logger.info('Saving conversation', { conversationId: state.conversationId });

    if (this.dbType === 'mongodb') {
      await this.saveConversationMongo(state);
    } else if (this.dbType === 'supabase') {
      await this.saveConversationSupabase(state);
    } else {
      await this.saveConversationMemory(state);
    }
  }

  async getConversation(conversationId: string): Promise<ConversationState | null> {
    if (this.dbType === 'mongodb') {
      return await this.getConversationMongo(conversationId);
    } else if (this.dbType === 'supabase') {
      return await this.getConversationSupabase(conversationId);
    } else {
      return await this.getConversationMemory(conversationId);
    }
  }

  async listConversations(userId: string, limit = 10, offset = 0): Promise<ConversationState[]> {
    if (this.dbType === 'mongodb') {
      return await this.listConversationsMongo(userId, limit, offset);
    } else if (this.dbType === 'supabase') {
      return await this.listConversationsSupabase(userId, limit, offset);
    } else {
      return await this.listConversationsMemory(userId, limit, offset);
    }
  }

  async linkConversationToPlan(conversationId: string, planId: string): Promise<void> {
    logger.info('Linking conversation to plan', { conversationId, planId });

    if (this.dbType === 'mongodb') {
      await this.linkConversationToPlanMongo(conversationId, planId);
    } else if (this.dbType === 'supabase') {
      await this.linkConversationToPlanSupabase(conversationId, planId);
    } else {
      await this.linkConversationToPlanMemory(conversationId, planId);
    }
  }

  /**
   * Conversation - MongoDB implementations
   */

  private async saveConversationMongo(state: ConversationState): Promise<void> {
    const client = await getMongoClient();
    const db = client.db('business_planner');
    await db.collection('conversations').updateOne(
      { conversationId: state.conversationId },
      { $set: state },
      { upsert: true }
    );
  }

  private async getConversationMongo(conversationId: string): Promise<ConversationState | null> {
    const client = await getMongoClient();
    const db = client.db('business_planner');
    return await db.collection('conversations').findOne({ conversationId }) as ConversationState | null;
  }

  private async listConversationsMongo(userId: string, limit: number, offset: number): Promise<ConversationState[]> {
    const client = await getMongoClient();
    const db = client.db('business_planner');
    return await db.collection('conversations')
      .find({ userId })
      .sort({ lastActiveAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray() as ConversationState[];
  }

  private async linkConversationToPlanMongo(conversationId: string, planId: string): Promise<void> {
    const client = await getMongoClient();
    const db = client.db('business_planner');
    await db.collection('conversations').updateOne(
      { conversationId },
      { $set: { linkedPlanId: planId } }
    );
  }

  /**
   * Conversation - Supabase implementations
   */

  private async saveConversationSupabase(state: ConversationState): Promise<void> {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('conversations')
      .upsert([state], { onConflict: 'conversationId' });
    if (error) throw error;
  }

  private async getConversationSupabase(conversationId: string): Promise<ConversationState | null> {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('conversations')
      .select('*')
      .eq('conversationId', conversationId)
      .single();
    if (error) return null;
    return data as ConversationState;
  }

  private async listConversationsSupabase(userId: string, limit: number, offset: number): Promise<ConversationState[]> {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('conversations')
      .select('*')
      .eq('userId', userId)
      .order('lastActiveAt', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data as ConversationState[];
  }

  private async linkConversationToPlanSupabase(conversationId: string, planId: string): Promise<void> {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('conversations')
      .update({ linkedPlanId: planId })
      .eq('conversationId', conversationId);
    if (error) throw error;
  }

  /**
   * Conversation - Memory implementations
   */

  private async saveConversationMemory(state: ConversationState): Promise<void> {
    this.memoryStore.set(`conversation:${state.conversationId}`, state);

    // Also store in user index
    const userConversations = this.memoryStore.get(`user_conversations:${state.userId}`) || [];
    if (!userConversations.includes(state.conversationId)) {
      userConversations.push(state.conversationId);
      this.memoryStore.set(`user_conversations:${state.userId}`, userConversations);
    }
  }

  private async getConversationMemory(conversationId: string): Promise<ConversationState | null> {
    return this.memoryStore.get(`conversation:${conversationId}`) || null;
  }

  private async listConversationsMemory(userId: string, limit: number, offset: number): Promise<ConversationState[]> {
    const conversationIds = this.memoryStore.get(`user_conversations:${userId}`) || [];
    const conversations = conversationIds
      .slice(offset, offset + limit)
      .map((id: string) => this.memoryStore.get(`conversation:${id}`))
      .filter((conv: any) => conv !== undefined)
      .sort((a: ConversationState, b: ConversationState) => b.lastActiveAt - a.lastActiveAt);
    return conversations;
  }

  private async linkConversationToPlanMemory(conversationId: string, planId: string): Promise<void> {
    const conversation = this.memoryStore.get(`conversation:${conversationId}`);
    if (conversation) {
      conversation.linkedPlanId = planId;
      this.memoryStore.set(`conversation:${conversationId}`, conversation);
    }
  }
}
