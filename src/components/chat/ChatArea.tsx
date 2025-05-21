"use client";
import React, { useRef, useEffect, useState } from 'react';
import { useConversations } from '@/context/ConversationsContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ConversationSummary from './ConversationSummary';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Sparkles } from 'lucide-react';

export default function ChatArea() {
  const {
    activeConversationId,
    getActiveConversation,
    isLoadingAiResponse,
    suggestedTopics,
    conversationSummary,
    clearConversationSummary,
  } = useConversations();

  const [selectedFollowUp, setSelectedFollowUp] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeConversation = getActiveConversation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  if (!activeConversationId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <BrainCircuit className="h-12 w-12 text-primary/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Welcome to Emotion Insights</h2>
        <p className="text-muted-foreground mb-6">
          Start a new conversation to explore your emotions with AI assistance.
        </p>
        {suggestedTopics.length > 0 && (
          <Card className="w-full max-w-md p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Suggested Topics
            </h3>
            <div className="space-y-2">
              {suggestedTopics.map((topic, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  onClick={() => {
                    // Handle topic selection
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4" ref={scrollRef}>
            {conversationSummary && (
              <ConversationSummary
                summary={conversationSummary}
                onClear={clearConversationSummary}
              />
            )}
            {activeConversation?.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLoading={isLoadingAiResponse && message.id === activeConversation.messages[activeConversation.messages.length - 1]?.id}
                onFollowUpSelect={setSelectedFollowUp}
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
        <MessageInput selectedFollowUp={selectedFollowUp} onFollowUpClear={() => setSelectedFollowUp(null)} />
      </div>
    </div>
  );
}
