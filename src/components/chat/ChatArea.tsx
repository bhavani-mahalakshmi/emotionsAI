"use client";
import React, { useRef, useEffect, useState } from 'react';
import { useConversations } from '@/context/ConversationsContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Sparkles, Plus, Menu, Trash2 } from 'lucide-react';
import type { Message } from '../../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function ChatArea() {
  const {
    activeConversationId,
    getActiveConversation,
    isLoadingAiResponse,
    createConversation,
    conversations,
    selectConversation,
    deleteConversation,
  } = useConversations();

  const [selectedFollowUp, setSelectedFollowUp] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeConversation = getActiveConversation();
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  useEffect(() => {
    if (activeConversationId) {
      setIsLoadingConversation(true);
      const conversation = getActiveConversation();
      if (conversation?.messages) {
        setIsLoadingConversation(false);
      }
    }
  }, [activeConversationId, getActiveConversation]);

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
          <div className="p-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                createConversation();
                setDrawerOpen(false);
              }}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
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

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Top bar with menu button */}
      <header className="flex items-center h-14 px-2 sm:px-4 border-b border-border bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <button
          type="button"
          aria-label="Open conversation drawer"
          onClick={() => setDrawerOpen(true)}
          className="mr-2 rounded-full p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <Menu className="w-6 h-6" />
        </button>
        {activeConversationId ? (
          <>
            <span className="font-semibold text-lg truncate flex-1">{activeConversation?.title || 'Chat'}</span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this conversation? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      deleteConversation(activeConversationId);
                      setDrawerOpen(false);
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <span className="font-semibold text-lg">Emotion Insights</span>
        )}
      </header>
      {/* Drawer */}
      {drawerOpen && <Drawer />}
      
      <main className="flex-1 pt-14 flex flex-col h-[calc(100vh-3.5rem)]">
        {!activeConversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 text-center">
            <div className="w-full max-w-lg mx-auto space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">Welcome to Emotion Insights</h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  Hi! How are you feeling today? I'm here to listen and support you.
                </p>
              </div>
              
              <Card className="w-full p-4 sm:p-6 shadow-lg border-border/40 bg-background/80 backdrop-blur">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-lg p-6"
                  onClick={() => createConversation()}
                >
                  <Plus className="h-5 w-5" />
                  Start a New Conversation
                </Button>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden w-full flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-2 sm:p-6 space-y-3 sm:space-y-6 w-full max-w-full" ref={scrollRef}>
                {activeConversation?.messages?.map((message: Message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isLoading={false}
                    onFollowUpSelect={setSelectedFollowUp}
                  />
                ))}
                {isLoadingAiResponse && activeConversation?.messages && (
                  <MessageBubble
                    message={{
                      id: 'loading',
                      role: 'agent',
                      content: 'Thinking...',
                      timestamp: new Date().toISOString()
                    }}
                    isLoading={true}
                  />
                )}
              </div>
            </ScrollArea>
          </div>
        )}
        <div className="mt-auto p-2 sm:p-4 border-t border-border/40 bg-background/80 backdrop-blur shadow-lg w-full pb-[env(safe-area-inset-bottom)]">
          <MessageInput 
            selectedFollowUp={selectedFollowUp} 
            onFollowUpClear={() => setSelectedFollowUp(null)}
            autoFocus={!!activeConversationId}
          />
        </div>
      </main>
    </div>
  );
}
