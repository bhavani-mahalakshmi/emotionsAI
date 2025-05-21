"use client";
import React from 'react';
import { useConversations } from '@/context/ConversationsContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MessageSquare, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ConversationList() {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    deleteConversation,
    renameConversation,
  } = useConversations();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={cn(
              "group relative flex items-center gap-2 rounded-lg p-2",
              "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              activeConversationId === conversation.id && "bg-gray-100 dark:bg-gray-800"
            )}
          >
            <button
              className="flex-1 text-left"
              onClick={() => selectConversation(conversation.id)}
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {conversation.title}
                </span>
                {conversation.lastMessage && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {conversation.lastMessage}
                  </span>
                )}
              </div>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <DropdownMenuItem
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    const newTitle = prompt('Enter new title:', conversation.title);
                    if (newTitle && newTitle.trim()) {
                      renameConversation(conversation.id, newTitle.trim());
                    }
                  }}
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => deleteConversation(conversation.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
