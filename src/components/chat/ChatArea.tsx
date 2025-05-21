"use client";
import React, { useRef, useEffect, useState } from 'react';
import { useConversations } from '@/context/ConversationsContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Sparkles, Plus, Menu } from 'lucide-react';

export default function ChatArea() {
  const {
    activeConversationId,
    getActiveConversation,
    isLoadingAiResponse,
    suggestedTopics,
    createConversation,
    conversations,
    selectConversation,
  } = useConversations();

  const [selectedFollowUp, setSelectedFollowUp] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeConversation = getActiveConversation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  // Drawer overlay and panel
  const Drawer = () => (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
        aria-label="Close conversation drawer"
        tabIndex={-1}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className="fixed top-0 left-0 z-50 h-full w-72 max-w-[90vw] bg-background shadow-xl border-r border-border flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-lg">Conversations</span>
          <button
            className="p-2 rounded hover:bg-muted focus:outline-none"
            aria-label="Close drawer"
            onClick={() => setDrawerOpen(false)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-border">
            {conversations.map(conv => (
              <li key={conv.id}>
                <button
                  className={`w-full text-left px-4 py-3 hover:bg-muted focus:bg-muted transition-colors ${conv.id === activeConversationId ? 'bg-primary/10 font-semibold' : ''}`}
                  onClick={() => {
                    selectConversation(conv.id);
                    setDrawerOpen(false);
                  }}
                  aria-current={conv.id === activeConversationId ? 'page' : undefined}
                >
                  {conv.title || 'Untitled Chat'}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );

  if (!activeConversationId) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 text-center bg-gradient-to-b from-background to-muted/20">
        <div className="w-full max-w-lg mx-auto space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Welcome to Emotion Insights</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Start a new conversation to explore your emotions with AI assistance.
            </p>
          </div>
          
          {suggestedTopics.length > 0 && (
            <Card className="w-full p-4 sm:p-6 shadow-lg border-border/40 bg-background/80 backdrop-blur">
              <h3 className="text-base font-medium mb-4 flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                Suggested Topics
              </h3>
              <div className="grid gap-3">
                {suggestedTopics.map((topic, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-4 rounded-lg hover:bg-muted/50 transition-colors text-base border border-border/40 hover:border-primary/20"
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
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Top bar with menu button */}
      <div className="flex items-center h-14 px-2 sm:px-4 border-b border-border bg-background/80 sticky top-0 z-20">
        <button
          type="button"
          aria-label="Open conversation drawer"
          onClick={() => setDrawerOpen(true)}
          className="mr-2 rounded-full p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-semibold text-lg truncate">{activeConversation?.title || 'Chat'}</span>
      </div>
      {/* Drawer */}
      {drawerOpen && <Drawer />}
      <div className="flex-1 overflow-hidden w-full">
        <ScrollArea className="h-full w-full">
          <div className="p-2 sm:p-6 space-y-3 sm:space-y-6 w-full max-w-full" ref={scrollRef}>
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
        {/* Floating Action Button for New Chat */}
        <button
          type="button"
          aria-label="Start a new chat"
          onClick={createConversation}
          className="fixed z-30 bottom-[88px] right-4 sm:bottom-8 sm:right-8 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 w-14 h-14 flex items-center justify-center transition-all duration-200"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
      <div className="p-2 sm:p-4 border-t border-border/40 bg-background/80 backdrop-blur shadow-lg w-full pb-[env(safe-area-inset-bottom)]">
        <MessageInput selectedFollowUp={selectedFollowUp} onFollowUpClear={() => setSelectedFollowUp(null)} />
      </div>
    </div>
  );
}
