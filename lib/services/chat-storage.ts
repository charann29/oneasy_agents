import { createClient } from '@/lib/supabase/client';

export interface ChatConversation {
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

export const chatStorageService = {
    /**
     * Create a new chat conversation
     */
    async createConversation(userId: string, language: string = 'en'): Promise<ChatConversation | null> {
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
    async getConversations(userId: string): Promise<ChatConversation[]> {
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
     * Get a specific conversation
     */
    async getConversation(conversationId: string): Promise<ChatConversation | null> {
        const client = createClient();

        const { data, error } = await client
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single();

        if (error) {
            console.error('Error fetching conversation:', error);
            return null;
        }

        return data;
    },

    /**
     * Update conversation
     */
    async updateConversation(
        conversationId: string,
        updates: Partial<Pick<ChatConversation, 'title' | 'current_phase' | 'progress'>>
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
     * Save a message
     */
    async saveMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<boolean> {
        const client = createClient();

        const { error } = await client
            .from('conversation_messages')
            .insert({ conversation_id: conversationId, role, content });

        if (error) {
            console.error('Error saving message:', error);
            return false;
        }

        await this.updateConversation(conversationId, {});
        return true;
    },

    /**
     * Get messages for a conversation
     */
    async getMessages(conversationId: string): Promise<Array<{ id: string, role: string, content: string, created_at: string }>> {
        const client = createClient();

        const { data, error } = await client
            .from('conversation_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at');

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Save an answer
     */
    async saveAnswer(conversationId: string, questionId: string, answer: any): Promise<boolean> {
        const client = createClient();

        const { data: existing } = await client
            .from('conversation_answers')
            .select('id')
            .eq('conversation_id', conversationId)
            .eq('question_id', questionId)
            .single();

        let error;
        if (existing) {
            ({ error } = await client
                .from('conversation_answers')
                .update({ answer })
                .eq('id', existing.id));
        } else {
            ({ error } = await client
                .from('conversation_answers')
                .insert({ conversation_id: conversationId, question_id: questionId, answer }));
        }

        if (error) {
            console.error('Error saving answer:', error);
            return false;
        }

        await this.updateConversation(conversationId, {});
        return true;
    },

    /**
     * Get answers for a conversation
     */
    async getAnswers(conversationId: string): Promise<Record<string, any>> {
        const client = createClient();

        const { data, error } = await client
            .from('conversation_answers')
            .select('*')
            .eq('conversation_id', conversationId);

        if (error) {
            console.error('Error fetching answers:', error);
            return {};
        }

        const answers: Record<string, any> = {};
        data?.forEach(row => {
            answers[row.question_id] = row.answer;
        });

        return answers;
    }
};
