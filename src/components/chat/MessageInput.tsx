"use client";
import React, { useRef, useState } from 'react';
import { useConversations } from '@/context/ConversationsContext';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  selectedFollowUp: string | null;
  onFollowUpClear: () => void;
}

export default function MessageInput({ selectedFollowUp, onFollowUpClear }: MessageInputProps) {
  const { activeConversationId, addMessage, isLoadingAiResponse } = useConversations();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeConversationId || isLoadingAiResponse) return;

    await addMessage(activeConversationId, message.trim());
    setMessage('');
    onFollowUpClear();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {selectedFollowUp && (
        <div className="mb-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-purple-800 dark:text-purple-200 flex-1">{selectedFollowUp}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-800"
              onClick={onFollowUpClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <div className="relative">
        <textarea
          ref={textareaRef}
          name="message"
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className={cn(
            "w-full resize-none rounded-lg border border-border/40 bg-background/60 backdrop-blur p-4 pr-12",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
            "placeholder:text-muted-foreground/50",
            "min-h-[60px] max-h-[200px]"
          )}
          disabled={!activeConversationId || isLoadingAiResponse}
        />
        <Button
          type="submit"
          size="icon"
          className={cn(
            "absolute right-2 bottom-2",
            "h-8 w-8",
            "bg-primary hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={!message.trim() || !activeConversationId || isLoadingAiResponse}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
