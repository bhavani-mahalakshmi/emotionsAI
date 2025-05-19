
"use client";

import { useConversations } from "@/context/ConversationsContext";
import ConversationItem from "./ConversationItem";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ConversationList() {
  const { conversations, activeConversationId, selectConversation } = useConversations();

  if (conversations.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground p-4 group-data-[collapsible=icon]:hidden">
        No chats yet. Start a new one!
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)] group-data-[collapsible=icon]:h-auto"> {/* Adjust height as needed */}
      <div className="space-y-1">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversationId}
            onSelect={() => selectConversation(conv.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
