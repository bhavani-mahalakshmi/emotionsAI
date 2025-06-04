import type { Conversation, Message } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE_URL}/conversations`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  return response.json();
}

export async function createConversation(): Promise<Conversation> {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create conversation' }));
      throw new Error(error.message || 'Failed to create conversation');
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.warn('Failed to parse server response, creating default conversation');
      data = {};
    }
    
    // Generate a unique ID if not provided by server
    const id = data.id || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Create a valid conversation object with fallback values
    const conversation: Conversation = {
      id,
      title: data.title || `Chat - ${new Date().toLocaleTimeString()}`,
      messages: data.messages || [],
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      lastMessage: data.lastMessage,
      lastMessageTime: data.lastMessageTime
    };

    return conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

export async function getConversation(id: string): Promise<Conversation> {
  const response = await fetch(`${API_BASE_URL}/conversations/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }
  return response.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/conversations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete conversation');
  }
}

export async function renameConversation(id: string, title: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/conversations/${id}/title`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error('Failed to rename conversation');
  }
}

export async function addMessage(conversationId: string, content: string): Promise<{ userMessage: Message; aiMessage: Message }> {
  // Validate conversation ID
  if (!conversationId) {
    console.error('Missing conversation ID');
    throw new Error('Invalid conversation ID: ID is missing');
  }
  
  if (typeof conversationId !== 'string') {
    console.error('Invalid conversation ID type:', typeof conversationId);
    throw new Error('Invalid conversation ID: ID must be a string');
  }

  if (!content || typeof content !== 'string') {
    throw new Error('Invalid message content');
  }

  try {
    console.log('Sending message to API:', { conversationId, content });
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to add message' }));
      console.error('API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.message || `Failed to add message: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    if (!data.userMessage || !data.aiMessage) {
      console.error('Invalid API response format:', data);
      throw new Error('Invalid response format from server');
    }
    
    return data;
  } catch (error) {
    console.error('Error in addMessage:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to add message');
  }
}

export async function getSuggestedTopics(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/suggested-topics`);
  if (!response.ok) {
    throw new Error('Failed to fetch suggested topics');
  }
  const data = await response.json();
  return data.topics;
} 