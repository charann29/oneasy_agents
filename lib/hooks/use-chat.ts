/**
 * React Hooks for Abhishek CA Chat
 * Provides easy-to-use hooks for conversational business planning
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

// API Configuration
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'demo-api-key-12345';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    phase?: string;
    dataExtracted?: Record<string, any>;
    confidence?: 'high' | 'medium' | 'low';
  };
}

export interface ChatState {
  conversationId: string;
  messages: ChatMessage[];
  phase: string;
  progress: number;
  extractedData: Record<string, any>;
  isComplete: boolean;
}

export interface ChatResponse {
  conversationId: string;
  message: string;
  phase: string;
  progress: number;
  extractedData?: Record<string, any>;
  suggestedActions?: string[];
  isComplete: boolean;
}

/**
 * Main hook for chatting with Abhishek CA
 */
export function useChatWithAbhishek(initialConversationId?: string) {
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<string>('getting_to_know');
  const [progress, setProgress] = useState<number>(0);
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send message to Abhishek
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMessage]);

      // Call API
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/abhishek`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();
      const chatResponse: ChatResponse = data.data;

      // Update conversation ID if this is first message
      if (!conversationId) {
        setConversationId(chatResponse.conversationId);
      }

      // Add assistant response to messages
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: chatResponse.message,
        timestamp: Date.now(),
        metadata: {
          phase: chatResponse.phase,
          dataExtracted: chatResponse.extractedData,
          confidence: chatResponse.extractedData ? 'high' : 'low'
        }
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update state
      setPhase(chatResponse.phase);
      setProgress(chatResponse.progress);
      setIsComplete(chatResponse.isComplete);
      setSuggestedActions(chatResponse.suggestedActions || []);

      // Merge extracted data
      if (chatResponse.extractedData) {
        setExtractedData(prev => ({ ...prev, ...chatResponse.extractedData }));
      }

      return chatResponse;

    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  /**
   * Load conversation state from server
   */
  const loadConversation = useCallback(async (convId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/chat/abhishek?conversationId=${convId}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }

      const data = await response.json();
      const conversation = data.data;

      setConversationId(conversation.conversationId);
      setMessages(conversation.messages);
      setPhase(conversation.phase);
      setProgress(conversation.progress);
      setExtractedData(conversation.extractedData);
      setIsComplete(conversation.progress >= 100);

      return conversation;

    } catch (err: any) {
      setError(err.message || 'Failed to load conversation');
      console.error('Load conversation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Start a new conversation
   */
  const startNewConversation = useCallback(() => {
    setConversationId(undefined);
    setMessages([]);
    setPhase('getting_to_know');
    setProgress(0);
    setExtractedData({});
    setIsComplete(false);
    setSuggestedActions([]);
    setError(null);
  }, []);

  /**
   * Get conversation history
   */
  const getHistory = useCallback(() => {
    return messages;
  }, [messages]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    conversationId,
    messages,
    phase,
    progress,
    extractedData,
    isComplete,
    suggestedActions,
    loading,
    error,

    // Actions
    sendMessage,
    loadConversation,
    startNewConversation,
    getHistory,
    clearError
  };
}

/**
 * Hook to list all conversations for current user
 */
interface ConversationListItem {
  conversationId: string;
  phase: string;
  progress: number;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export function useConversationList() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async (limit = 10, offset = 0) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/chat/abhishek?list=true&limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }

      const data = await response.json();
      setConversations(data.data.conversations);

      return data.data.conversations;

    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
      console.error('Load conversations error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    refresh: loadConversations
  };
}

/**
 * Hook for streaming chat responses (future enhancement)
 * Currently returns standard response, but ready for SSE integration
 */
export function useStreamingChat(initialConversationId?: string) {
  const chat = useChatWithAbhishek(initialConversationId);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Future: Add SSE streaming support
  const sendMessageStreaming = async (message: string) => {
    setIsStreaming(true);
    try {
      return await chat.sendMessage(message);
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    ...chat,
    isStreaming,
    sendMessageStreaming
  };
}

/**
 * Direct API functions for use outside React components
 */
export const ChatAPI = {
  /**
   * Send message to Abhishek
   */
  sendMessage: async (message: string, conversationId?: string): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/abhishek`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversationId, message })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get conversation by ID
   */
  getConversation: async (conversationId: string): Promise<ChatState> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/chat/abhishek?conversationId=${conversationId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load conversation');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * List conversations
   */
  listConversations: async (limit = 10, offset = 0): Promise<ChatState[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/chat/abhishek?list=true&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load conversations');
    }

    const data = await response.json();
    return data.data.conversations;
  }
};
