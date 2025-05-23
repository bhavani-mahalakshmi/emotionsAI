import type { Conversation, Message } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE_URL}/conversations`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  return response.json();
}

export async function createConversation(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }
  const data = await response.json();
  return data.id;
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
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error('Failed to add message');
  }
  return response.json();
}

export async function getSuggestedTopics(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/suggested-topics`);
  if (!response.ok) {
    throw new Error('Failed to fetch suggested topics');
  }
  const data = await response.json();
  return data.topics;
} 