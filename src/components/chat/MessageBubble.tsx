"use client";
import React from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, UserCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
  onFollowUpSelect?: (question: string) => void;
}

export default function MessageBubble({ message, isLoading, onFollowUpSelect }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex gap-2 sm:gap-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className="flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-muted/50 flex items-center justify-center shadow-sm">
        {isUser ? (
          <UserCircle className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
        ) : (
          <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
        )}
      </div>
      <div className={cn(
        "flex flex-col gap-2 max-w-[95vw] sm:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <Card className={cn(
          "px-3 py-2 sm:p-5 shadow-sm text-base",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted/50",
          isLoading && "animate-pulse"
        )}>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[60%]" />
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words leading-relaxed text-base">{message.content}</p>
          )}
        </Card>
        {/* Only show analysis if it exists and contains more than just the insights */}
        {message.analysis && !isLoading && (message.analysis.emotionalTone || message.analysis.possibleReasons?.length || message.analysis.suggestions?.length) && (
          <div className="w-full space-y-2">
            {message.analysis.emotionalTone && (
              <Card className="px-3 py-2 sm:p-4 bg-muted/30 shadow-sm border border-border/40 text-base">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{message.analysis.emotionalTone}</p>
              </Card>
            )}
            {message.analysis.followUpQuestions && message.analysis.followUpQuestions.length > 0 && (
              <ScrollArea className="w-full">
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                  {message.analysis.followUpQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="whitespace-normal h-auto py-2 px-4 text-base min-w-[44px] min-h-[44px] shadow-sm hover:shadow transition-all duration-200"
                      onClick={() => onFollowUpSelect?.(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
