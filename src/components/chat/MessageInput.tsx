
"use client";

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal } from "lucide-react";
import { useConversations } from "@/context/ConversationsContext";

interface MessageInputProps {
  conversationId: string;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const { addMessage, isLoadingAiResponse } = useConversations();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (message.trim() === '' || isLoadingAiResponse) return;
    await addMessage(conversationId, message.trim());
    setMessage('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };
  
  // Auto-resize textarea
  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    textarea.style.height = 'auto'; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
    setMessage(textarea.value);
  };


  return (
    <div className="flex items-end space-x-2">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Share your thoughts or feelings..."
        className="flex-1 resize-none min-h-[40px] max-h-[150px] rounded-lg shadow-sm focus-visible:ring-primary focus-visible:ring-offset-0"
        disabled={isLoadingAiResponse}
        rows={1}
      />
      <Button 
        type="button" 
        onClick={handleSubmit} 
        disabled={isLoadingAiResponse || message.trim() === ''}
        className="h-10 w-10 p-0 rounded-lg"
        aria-label="Send message"
      >
        <SendHorizonal size={20} />
      </Button>
    </div>
  );
}
