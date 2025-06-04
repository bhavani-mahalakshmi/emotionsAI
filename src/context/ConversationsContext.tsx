"use client";

import type { Conversation, Message } from '../types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import * as api from '@/lib/api';

const AI_MESSAGE_HISTORY_LIMIT = 20; // Max messages to send to AI for context
const MESSAGE_WARNING_THRESHOLD = 15; // Show warning when approaching limit
const MESSAGE_LIMIT = 25; // Hard limit on messages per conversation

interface ConversationsContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoadingAiResponse: boolean;
  createConversation: (initialMessage?: string) => Promise<string>;
  selectConversation: (id: string | null) => void;
  addMessage: (conversationId: string, messageContent: string) => Promise<void>;
  getActiveConversation: () => Conversation | undefined;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const ConversationsProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false);
  const { toast } = useToast();

  // Load conversations from API on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const loadedConversations = await api.getConversations();
        setConversations(loadedConversations);
      } catch (error) {
        console.error('Failed to load conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations. Please try again.",
          variant: "destructive",
        });
      }
    };
    loadConversations();
  }, [toast]);

  const addMessage = useCallback(async (conversationId: string, messageContent: string) => {
    const id = String(conversationId);
    
    const currentConversation = conversations.find(c => c.id === id);
    if (!currentConversation) {
      throw new Error('Conversation not found');
    }

    // Show warning if conversation is getting long
    const messageCount = currentConversation.messages?.length || 0;
    if (messageCount + 1 > MESSAGE_WARNING_THRESHOLD) {
      toast({
        title: "Long Conversation",
        description: "This conversation is getting quite long. Consider starting a new chat for new topics.",
        variant: "default",
      });
    }

    // Create temporary user message for optimistic update
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    // Update UI optimistically with user message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id
          ? {
              ...conv,
              messages: [...(conv.messages || []), tempUserMessage],
              updatedAt: new Date().toISOString()
            }
          : conv
      )
    );

    try {
      setIsLoadingAiResponse(true);
      // Send to API and get real messages
      const { userMessage, aiMessage } = await api.addMessage(id, messageContent);
      
      // Update with real messages
      setConversations(prev =>
        prev.map(conv =>
          conv.id === id
            ? {
                ...conv,
                messages: [
                  ...conv.messages.filter(m => m.id !== tempUserMessage.id && m.id !== userMessage.id),
                  userMessage,
                  aiMessage
                ],
                updatedAt: new Date().toISOString(),
                lastMessage: aiMessage.content,
                lastMessageTime: aiMessage.timestamp
              }
            : conv
        )
      );
    } catch (error) {
      // On error, remove the temporary message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === id
            ? {
                ...conv,
                messages: conv.messages.filter(m => m.id !== tempUserMessage.id)
              }
            : conv
        )
      );
      console.error('Failed to add message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoadingAiResponse(false);
    }
  }, [conversations, toast]);

  const createConversation = useCallback(async (initialMessage?: string) => {
    try {
      // Create the conversation on the server
      const newConversation = await api.createConversation();
      console.log('Server response for new conversation:', newConversation);
      
      if (!newConversation?.id) {
        console.error('Invalid conversation response:', newConversation);
        throw new Error('Invalid conversation response: missing ID');
      }

      // Create a complete conversation object
      const conversation: Conversation = {
        id: String(newConversation.id),
        title: newConversation.title || `Chat - ${new Date().toLocaleTimeString()}`,
        messages: [],
        createdAt: newConversation.createdAt || new Date().toISOString(),
        updatedAt: newConversation.updatedAt || new Date().toISOString(),
        lastMessage: undefined,
        lastMessageTime: undefined
      };

      console.log('Created conversation object:', conversation);

      // Add the conversation to state
      setConversations(prev => [conversation, ...prev]);
      setActiveConversationId(conversation.id);

      // If there's an initial message, add it
      if (initialMessage) {
        try {
          setIsLoadingAiResponse(true);
          const { userMessage, aiMessage } = await api.addMessage(conversation.id, initialMessage);
          
          const updatedConversation = {
            ...conversation,
            messages: [userMessage, aiMessage],
            lastMessage: aiMessage.content,
            lastMessageTime: aiMessage.timestamp,
            updatedAt: new Date().toISOString()
          };
          setConversations(prev => 
            prev.map(conv => conv.id === conversation.id ? updatedConversation : conv)
          );
        } catch (error) {
          console.error('Failed to add initial message:', error);
          toast({
            title: "Error",
            description: "Failed to send initial message. Please try again.",
            variant: "destructive",
          });
        }
      }

      return conversation.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoadingAiResponse(false);
    }
  }, [toast]);

  const selectConversation = useCallback(async (id: string | null) => {
    setActiveConversationId(id);
    
    if (id) {
      try {
        const conversation = await api.getConversation(id);
        setConversations(prev =>
          prev.map(conv =>
            conv.id === id ? conversation : conv
          )
        );
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
        toast({
          title: "Error",
          description: "Failed to load conversation. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const getActiveConversation = useCallback(() => {
    return conversations.find(c => c.id === activeConversationId);
  }, [conversations, activeConversationId]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeConversationId, toast]);

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      await api.renameConversation(id, newTitle);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === id
            ? { ...conv, title: newTitle }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      toast({
        title: "Error",
        description: "Failed to rename conversation. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const value = {
    conversations,
    activeConversationId,
    isLoadingAiResponse,
    createConversation,
    selectConversation,
    addMessage,
    getActiveConversation,
    deleteConversation,
    renameConversation,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
};

export const useConversations = () => {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
};
