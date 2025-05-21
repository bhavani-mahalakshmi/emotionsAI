"use client";

import type { Conversation, Message } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { analyzeEmotion, AnalyzeEmotionInput } from '@/ai/flows/analyze-emotion';
import { suggestTopics, SuggestTopicsInput } from '@/ai/flows/suggest-topics';
import { useToast } from "@/hooks/use-toast";

const AI_MESSAGE_HISTORY_LIMIT = 20; // Max messages to send to AI for context
const MESSAGE_WARNING_THRESHOLD = 15; // Show warning when approaching limit

interface ConversationsContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoadingAiResponse: boolean;
  suggestedTopics: string[];
  fetchSuggestedTopics: () => Promise<void>;
  createConversation: () => Promise<string>;
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
  const [suggestedTopics, setSuggestedTopicsState] = useState<string[]>([]);
  const { toast } = useToast();

  // Load conversations from localStorage on mount
  useEffect(() => {
    const storedConversations = localStorage.getItem('emotionInsightsConversations');
    if (storedConversations) {
      const parsedConversations: Conversation[] = JSON.parse(storedConversations).map((conv: Conversation) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
        }))
      }));
      setConversations(parsedConversations);
    }
    const storedActiveId = localStorage.getItem('emotionInsightsActiveConversationId');
    if (storedActiveId && storedActiveId !== "null") {
        setActiveConversationId(storedActiveId);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('emotionInsightsConversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('emotionInsightsActiveConversationId', activeConversationId || "null");
  }, [activeConversationId]);


  const fetchSuggestedTopics = useCallback(async () => {
    try {
      setIsLoadingAiResponse(true);
      const result = await suggestTopics({} as SuggestTopicsInput); // Empty input
      setSuggestedTopicsState(result.topics);
    } catch (error) {
      console.error("Error fetching suggested topics:", error);
      toast({
        title: "Error",
        description: "Could not fetch suggested topics.",
        variant: "destructive",
      });
      setSuggestedTopicsState([]);
    } finally {
      setIsLoadingAiResponse(false);
    }
  }, [toast]);

  const createConversation = useCallback(async () => {
    const newConversationId = crypto.randomUUID();
    const now = new Date();
    const newConversation: Conversation = {
      id: newConversationId,
      title: `Chat - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversationId);
    await fetchSuggestedTopics(); // Fetch topics for the new chat
    return newConversationId;
  }, [fetchSuggestedTopics]);

  const selectConversation = (id: string | null) => {
    setActiveConversationId(id);
    if (id) {
        const activeConv = conversations.find(c => c.id === id);
        if (activeConv && activeConv.messages.length === 0) {
            fetchSuggestedTopics();
        } else {
            setSuggestedTopicsState([]); // Clear topics if conversation has messages
        }
    } else {
        setSuggestedTopicsState([]); // Clear topics if no conversation selected
    }
  };

  const addMessage = async (conversationId: string, messageContent: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, userMessage], updatedAt: new Date() }
          : conv
      )
    );
    
    setIsLoadingAiResponse(true);

    try {
      const currentConversation = conversations.find(c => c.id === conversationId);
      if (!currentConversation) throw new Error("Conversation not found");

      // Send the complete conversation history
      const historyForAI = currentConversation.messages.map(msg => ({ 
        role: msg.role, 
        content: msg.content,
        formattedMessage: `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.content}`
      }));
      
      // Add current message to history
      historyForAI.push({
        role: 'user', 
        content: messageContent,
        formattedMessage: `User: ${messageContent}`
      });

      // Show warning if conversation is getting long
      if (currentConversation.messages.length + 1 > MESSAGE_WARNING_THRESHOLD) {
        toast({
          title: "Long Conversation",
          description: "This conversation is getting quite long. Consider starting a new chat for new topics.",
          variant: "default",
        });
      }
      
      const aiInput: AnalyzeEmotionInput = {
        message: messageContent,
        conversationHistory: historyForAI,
      };
      
      const aiResponse = await analyzeEmotion(aiInput);

      const agentMessage: Message = {
        id: crypto.randomUUID(),
        role: 'agent',
        content: aiResponse.insights,
        timestamp: new Date(),
        emotion: aiResponse.emotionalTone,
        insights: aiResponse.insights,
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, agentMessage], updatedAt: new Date() }
            : conv
        )
      );
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "AI Error",
        description: "Could not get a response from the assistant. Please try again.",
        variant: "destructive",
      });
      // Add an error message to the chat
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'agent',
        content: "I'm sorry, I encountered an error. Please try sending your message again.",
        timestamp: new Date(),
      };
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, errorMessage], updatedAt: new Date() }
            : conv
        )
      );
    } finally {
      setIsLoadingAiResponse(false);
    }
  };

  const getActiveConversation = useCallback(() => {
    return conversations.find(conv => conv.id === activeConversationId);
  }, [conversations, activeConversationId]);

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(conv => conv.id === id ? {...conv, title: newTitle, updatedAt: new Date()} : conv));
  };

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        activeConversationId,
        isLoadingAiResponse,
        suggestedTopics,
        fetchSuggestedTopics,
        createConversation,
        selectConversation,
        addMessage,
        getActiveConversation,
        deleteConversation,
        renameConversation,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
};

export const useConversations = (): ConversationsContextType => {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
};
