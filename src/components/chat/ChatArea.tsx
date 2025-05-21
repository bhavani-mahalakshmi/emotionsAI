"use client";

import { useEffect, useRef } from 'react';
import { useConversations } from "@/context/ConversationsContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Sparkles, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface EmotionAnalysis {
  emotionalTone: string;
  insights: string;
  possibleReasons: string[];
  suggestions: string[];
  followUpQuestions: string[];
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'agent';
  analysis?: EmotionAnalysis;
}

const MessageDisplay = ({ message }: { message: Message }) => {
  return (
    <div className="space-y-4">
      <MessageBubble content={message.content} role={message.role} />
      {message.analysis && (
        <div className="ml-4 space-y-3 text-sm">
          <div className="text-muted-foreground">{message.analysis.insights}</div>
          {message.analysis.followUpQuestions && message.analysis.followUpQuestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-primary">Follow-up questions:</div>
              {message.analysis.followUpQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left w-full hover:bg-primary/10 rounded-lg p-2"
                  onClick={() => {
                    const input = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
                    if (input) {
                      input.value = question;
                      input.focus();
                    }
                  }}
                >
                  <span className="text-primary mr-2">→</span>
                  {question}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ChatArea() {
  const { getActiveConversation, isLoadingAiResponse, suggestedTopics, fetchSuggestedTopics, addMessage, activeConversationId } = useConversations();
  const activeConversation = getActiveConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeConversationId && suggestedTopics.length === 0) {
        fetchSuggestedTopics();
    }
  }, [activeConversationId, fetchSuggestedTopics, suggestedTopics.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, isLoadingAiResponse]);

  const handleTopicClick = (topic: string) => {
    if (activeConversationId) {
      addMessage(activeConversationId, topic);
    }
  };
  
  if (!activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background">
        <Bot className="h-16 w-16 text-primary mb-6" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to Emotion Insights</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Start a new chat to explore your feelings, or select an existing conversation from the sidebar.
        </p>
        {suggestedTopics.length > 0 && (
             <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-accent"/>Suggested Starters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {suggestedTopics.map((topic, index) => (
                        <Button 
                            key={index} 
                            variant="outline" 
                            className="w-full justify-start text-left h-auto py-2 whitespace-normal" 
                            onClick={() => alert("Please start a new chat first to use this topic.")}
                        >
                            {topic}
                        </Button>
                    ))}
                </CardContent>
            </Card>
        )}
        {isLoadingAiResponse && suggestedTopics.length === 0 && (
            <div className="w-full max-w-md space-y-2 mt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background shadow-inner">
      <ScrollArea className="flex-1 p-4 sm:p-6 space-y-4">
        {activeConversation.messages.length === 0 && suggestedTopics.length > 0 && (
          <div className="mb-6">
            <Card className="w-full max-w-2xl mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><ThumbsUp className="h-5 w-5 text-primary"/>How are you feeling today?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {suggestedTopics.map((topic, index) => (
                        <Button 
                            key={index} 
                            variant="outline" 
                            className="w-full justify-start text-left h-auto py-2 whitespace-normal" 
                            onClick={() => handleTopicClick(topic)}
                        >
                            {topic}
                        </Button>
                    ))}
                </CardContent>
            </Card>
          </div>
        )}
        {activeConversation.messages.map((msg) => (
          <MessageDisplay key={msg.id} message={msg} />
        ))}
        {isLoadingAiResponse && activeConversation.messages[activeConversation.messages.length -1]?.role === 'user' && (
           <div className="flex items-end space-x-2 animate-pulse mb-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot size={18} />
            </div>
            <div className="flex flex-col space-y-1">
                <div className="inline-block rounded-lg rounded-bl-none bg-muted p-3 shadow-sm">
                    <div className="h-4 w-20 rounded bg-muted-foreground/30"></div>
                </div>
            </div>
        </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <div className="p-4 border-t border-border bg-background sticky bottom-0">
        <MessageInput conversationId={activeConversation.id} />
      </div>
    </div>
  );
}
