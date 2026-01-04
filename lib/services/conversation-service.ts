import { createClient } from '@/lib/supabase/client';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  current_phase: number;
  progress: number;
  language: string;
  is_active: boolean;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ConversationAnswer {
  id: string;
  conversation_id: string;
  question_id: string;
  answer: any;
  created_at: string;
}

export const conversationService = {
  /**
   * Create a new conversation
   */
  async createConversation(userId: string, language: string = 'en'): Promise<Conversation | null> {
    const client = createClient();

    const { data, error } = await client
      .from('conversations')
      .insert({
        user_id: userId,
        title: 'New Conversation',
        language,
        current_phase: 0,
        progress: 0,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  },

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    const client = createClient();

    const { data, error } = await client
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get a specific conversation with messages and answers
   */
  async getConversation(conversationId: string): Promise<{
    conversation: Conversation | null;
    messages: ConversationMessage[];
    answers: ConversationAnswer[];
  }> {
    const client = createClient();

    const [convResult, messagesResult, answersResult] = await Promise.all([
      client.from('conversations').select('*').eq('id', conversationId).single(),
      client.from('conversation_messages').select('*').eq('conversation_id', conversationId).order('created_at'),
      client.from('conversation_answers').select('*').eq('conversation_id', conversationId)
    ]);

    return {
      conversation: convResult.data,
      messages: messagesResult.data || [],
      answers: answersResult.data || []
    };
  },

  /**
   * Update conversation metadata
   */
  async updateConversation(
    conversationId: string,
    updates: Partial<Pick<Conversation, 'title' | 'current_phase' | 'progress' | 'is_active'>>
  ): Promise<boolean> {
    const client = createClient();

    const { error } = await client
      .from('conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation:', error);
      return false;
    }

    return true;
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    const client = createClient();

    const { error } = await client
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }

    return true;
  },

  /**
   * Save a message to a conversation
   */
  async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string
  ): Promise<boolean> {
    const client = createClient();

    const { error } = await client
      .from('conversation_messages')
      .insert({ conversation_id: conversationId, role, content });

    if (error) {
      console.error('Error saving message:', error);
      return false;
    }

    // Update conversation's updated_at
    await this.updateConversation(conversationId, {});

    return true;
  },

  /**
   * Save an answer to a conversation
   */
  async saveAnswer(conversationId: string, questionId: string, answer: any): Promise<boolean> {
    const client = createClient();

    // Check if answer already exists
    const { data: existing } = await client
      .from('conversation_answers')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('question_id', questionId)
      .single();

    let error;
    if (existing) {
      // Update existing answer
      ({ error } = await client
        .from('conversation_answers')
        .update({ answer })
        .eq('id', existing.id));
    } else {
      // Insert new answer
      ({ error } = await client
        .from('conversation_answers')
        .insert({ conversation_id: conversationId, question_id: questionId, answer }));
    }

    if (error) {
      console.error('Error saving answer:', error);
      return false;
    }

    // Update conversation's updated_at
    await this.updateConversation(conversationId, {});

    return true;
  },

  /**
   * Generate a conversation title from the first answer
   */
  generateTitle(firstAnswer: string): string {
    const maxLength = 50;
    const cleaned = firstAnswer.trim().replace(/\n/g, ' ');
    return cleaned.length > maxLength
      ? cleaned.substring(0, maxLength) + '...'
      : cleaned;
  }
};
