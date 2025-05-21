"use client";
import React from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, UserCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
    analysis?: {
      emotionalTone: string;
      insights: string;
      possibleReasons: string[];
      suggestions: string[];
      followUpQuestions: string[];
    };
  };
  isLoading?: boolean;
  onFollowUpSelect?: (question: string) => void;
}

export default function MessageBubble({
  message,
  isLoading = false,
  onFollowUpSelect,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex gap-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-300" />
        </div>
      )}
      <div className={cn(
        "flex flex-col gap-2 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* User message: show only content */}
        {isUser && (
          <Card className={cn(
            "p-4",
            "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-100 dark:border-blue-800"
          )}>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
          </Card>
        )}
        {/* AI message: show only analysis insight and follow-up questions if present, otherwise show content */}
        {!isUser && message.analysis && !isLoading ? (
          <Card className="w-full p-4 space-y-4 bg-purple-50 text-purple-900 border border-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:border-purple-800 backdrop-blur">
            <div className="space-y-3">
              {/* Main Insight Section */}
              <div className="space-y-2">
                <blockquote className="italic text-base text-purple-900 dark:text-purple-100 leading-relaxed">
                  {message.analysis.insights}
                </blockquote>
              </div>
              {/* Follow-up Questions Section */}
              {message.analysis.followUpQuestions.length > 0 && (
                <div className="space-y-2 bg-purple-100/60 dark:bg-purple-900/60 rounded-lg p-3">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-200 block mb-1">Follow-up Questions:</span>
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-2 pr-4">
                      {message.analysis.followUpQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2 text-sm border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200 bg-white dark:bg-purple-950 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                          onClick={() => onFollowUpSelect?.(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </Card>
        ) : null}
        {/* AI message with no analysis: show content */}
        {!isUser && !message.analysis && !isLoading && (
          <Card className={cn(
            "p-4",
            "bg-purple-50 text-purple-900 border border-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:border-purple-800"
          )}>
            <p className="text-sm">{message.content}</p>
          </Card>
        )}
        {/* Loading state for AI message */}
        {!isUser && isLoading && (
          <Card className={cn(
            "p-4",
            "bg-purple-50 text-purple-900 border border-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:border-purple-800"
          )}>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </Card>
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-200" />
        </div>
      )}
    </div>
  );
}
