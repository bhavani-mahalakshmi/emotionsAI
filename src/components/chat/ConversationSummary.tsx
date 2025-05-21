"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConversationSummaryProps {
  summary: string;
  onClear: () => void;
}

export default function ConversationSummary({ summary, onClear }: ConversationSummaryProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: "Copied!",
        description: "The conversation summary has been copied to your clipboard.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy the summary to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 mb-4 bg-muted/50 border-2 border-primary/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Conversation Summary</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
} 