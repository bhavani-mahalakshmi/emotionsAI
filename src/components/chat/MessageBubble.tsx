"use client";

import type { Message } from "@/types";
import { cn } from "@/lib/utils";
import { User, Bot, Smile, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const formattedTime = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          
          {message.role === 'agent' && (message.emotion || message.insights) && message.content !== message.insights && (
            <div className="mt-2 pt-2 border-t border-border/50">
              {message.emotion && (
                <div className="flex items-center text-xs text-muted-foreground mb-1">
                  <Smile size={14} className="mr-1 text-accent" />
                  Emotional Tone: <Badge variant="secondary" className="ml-1">{message.emotion}</Badge>
                </div>
              )}
              {message.insights && (
                <div className="flex items-start text-xs text-muted-foreground">
                  <Lightbulb size={14} className="mr-1 mt-0.5 text-accent shrink-0" />
                  <p><span className="font-medium">Insights:</span> {message.insights}</p>
                </div>
              )}
            </div>
          )}

          {message.analysis && (
            <div className="mt-2 text-sm text-muted-foreground border-l-2 border-primary/20 pl-3">
              <div className="font-medium text-primary/80">{message.analysis.emotionalTone}</div>
              <p className="mt-1">{message.analysis.insights}</p>
              {message.analysis.possibleReasons && message.analysis.possibleReasons.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium mb-1">Possible reasons:</div>
                  <ul className="list-disc list-inside">
                    {message.analysis.possibleReasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              {message.analysis.suggestions && message.analysis.suggestions.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium mb-1">Suggestions:</div>
                  <ul className="list-disc list-inside">
                    {message.analysis.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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
