"use client";
import React, { useRef, useEffect } from 'react';
import { useConversations } from '@/context/ConversationsContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Sparkles } from 'lucide-react';

export default function ChatArea() {
  const {
    activeConversationId,
    getActiveConversation,
    isLoadingAiResponse,
    suggestedTopics,
  } = useConversations();

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeConversation = getActiveConversation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  if (!activeConversationId) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 bg-background/60 backdrop-blur">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Welcome to Emotion Insights</h2>
            <p className="text-muted-foreground">
              Start a new conversation to explore your emotions and gain insights.
            </p>
            {suggestedTopics.length > 0 && (
              <div className="w-full mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Suggested Topics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedTopics.map((topic, index) => (
                    <button
                      key={index}
                      className="p-3 text-left rounded-lg border border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4" ref={scrollRef}>
            {activeConversation?.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLoading={isLoadingAiResponse && message.id === activeConversation.messages[activeConversation.messages.length - 1]?.id}
              />
            ))}
            {isLoadingAiResponse && !activeConversation?.messages.some(m => m.role === 'agent') && (
              <MessageBubble
                message={{
                  id: 'loading',
                  role: 'agent',
                  content: 'Thinking...',
                  timestamp: new Date(),
                }}
                isLoading={true}
              />
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t border-border/40 bg-background/60 backdrop-blur">
        <MessageInput />
      </div>
    </div>
  );
}
