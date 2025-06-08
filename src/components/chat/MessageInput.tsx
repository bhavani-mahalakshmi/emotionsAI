"use client";
import React, { useRef, useState, useEffect } from 'react';
import { useConversations } from '@/context/ConversationsContext';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  selectedFollowUp: string | null;
  onFollowUpClear: () => void;
  autoFocus?: boolean;
}

export default function MessageInput({ selectedFollowUp, onFollowUpClear, autoFocus }: MessageInputProps) {
  const { activeConversationId, addMessage, isLoadingAiResponse, createConversation } = useConversations();
  const [message, setMessage] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);



  useEffect(() => {
    // Focus when the component mounts, autoFocus is true, activeConversationId changes, or selectedFollowUp changes
    if (textareaRef.current && (autoFocus || activeConversationId || selectedFollowUp)) {
      textareaRef.current.focus();
      // Scroll the textarea into view with smooth behavior
      textareaRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    }
  }, [autoFocus, activeConversationId, selectedFollowUp]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoadingAiResponse || isCreatingConversation) return;

    const messageToSend = message.trim();
    if (!messageToSend) return;
    
    // Combine message with follow-up context if present
    const messageContent = selectedFollowUp 
      ? `Regarding your question "${selectedFollowUp}": ${messageToSend}`
      : messageToSend;
    
    setMessage('');
    onFollowUpClear(); // Clear the selected follow-up

    try {
      if (!activeConversationId) {
        // If no active conversation, create one and send first message in one step
        setIsCreatingConversation(true);
        await createConversation(messageContent);
      } else {
        // Add message to existing conversation
        await addMessage(activeConversationId, messageContent);
      }
    } catch (error) {
      // Restore the message if there was an error
      setMessage(messageContent);
      throw error;
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-full flex flex-col gap-2 pb-[env(safe-area-inset-bottom)] px-2">
      {selectedFollowUp && (
        <div className="mb-2 p-3 bg-primary/5 rounded-lg border border-primary/10 w-full">
          <div className="flex items-start justify-between gap-3">
            <p className="text-base text-primary flex-1">{selectedFollowUp}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-primary/60 hover:text-primary hover:bg-primary/10 min-w-[44px] min-h-[44px]"
              onClick={onFollowUpClear}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      <div className="relative w-full flex items-end gap-2">
        <textarea
          ref={textareaRef}
          name="message"
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className={cn(
            "w-full max-w-full resize-none rounded-xl border border-border/40 bg-background/60 backdrop-blur p-4 pr-14",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
            "placeholder:text-muted-foreground/50",
            "min-h-[44px] max-h-[200px]",
            "text-base leading-6",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={isLoadingAiResponse || isCreatingConversation}
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          className={cn(
            "h-12 w-12 min-w-[44px] min-h-[44px]",
            "bg-primary hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200",
            "shadow-lg shadow-primary/20",
            "hover:shadow-xl hover:shadow-primary/30",
            "active:scale-95"
          )}
          disabled={!message.trim() || isLoadingAiResponse || isCreatingConversation}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
