"use client";

import type { Message } from "@/types";
import { cn } from "@/lib/utils";
import { User, Bot, Smile, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export interface MessageBubbleProps {
  content: string;
  role: 'user' | 'agent';
}

export default function MessageBubble({ content, role }: MessageBubbleProps) {
  const isUser = role === 'user';
  const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn("flex items-end space-x-2 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot size={18} />
        </div>
      )}
      
      <Card className={cn(
        "max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-xl shadow-md",
        isUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none border border-border"
      )}>
        <CardContent className="p-3">
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        </CardContent>
        <CardFooter className="px-3 py-1">
            <p className={cn(
                "text-xs",
                isUser ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
                {formattedTime}
            </p>
        </CardFooter>
      </Card>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <User size={18} />
        </div>
      )}
    </div>
  );
}
