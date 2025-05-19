
"use client";
import type { Conversation } from "@/types";
import { Button } from "@/components/ui/button";
import { MessageSquareText, Trash2, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversations } from "@/context/ConversationsContext";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
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


interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}

export default function ConversationItem({ conversation, isActive, onSelect }: ConversationItemProps) {
  const { deleteConversation, renameConversation } = useConversations();
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const lastMessage = conversation.messages.length > 0 
    ? conversation.messages[conversation.messages.length - 1]
    : null;
  const snippet = lastMessage 
    ? (lastMessage.role === 'user' ? 'You: ' : 'AI: ') + lastMessage.content.substring(0, 25) + (lastMessage.content.length > 25 ? '...' : '')
    : 'No messages yet';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRename = () => {
    if (editingTitle.trim() && editingTitle.trim() !== conversation.title) {
      renameConversation(conversation.id, editingTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditingTitle(conversation.title);
      setIsEditing(false);
    }
  };


  if (isEditing) {
    return (
      <div className="p-2">
        <Input
          ref={inputRef}
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm bg-sidebar-accent"
        />
      </div>
    );
  }
  
  return (
    <div className={cn(
        "group relative rounded-md hover:bg-sidebar-accent",
        isActive && "bg-sidebar-accent"
      )}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start text-left h-auto py-2 px-2 flex flex-col items-start group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:py-3",
          isActive ? "text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"
        )}
        onClick={onSelect}
        aria-current={isActive ? "page" : undefined}
      >
        <div className="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center">
            <MessageSquareText className="h-4 w-4 shrink-0 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
            <span className="truncate text-sm group-data-[collapsible=icon]:hidden flex-grow">{conversation.title}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-1 group-data-[collapsible=icon]:hidden w-full">{snippet}</p>
      </Button>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 group-hover:opacity-100 md:opacity-0 focus-within:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden flex gap-1">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)} aria-label="Edit conversation title">
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive" aria-label="Delete conversation">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this conversation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteConversation(conversation.id)} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
