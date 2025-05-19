
"use client";

import { Button } from "@/components/ui/button";
import { useConversations } from "@/context/ConversationsContext";
import { MessageSquarePlus } from "lucide-react";

export default function NewChatButton() {
  const { createConversation } = useConversations();

  const handleNewChat = async () => {
    await createConversation();
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 px-2 mb-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:h-auto"
      onClick={handleNewChat}
      aria-label="Start a new chat"
    >
      <MessageSquarePlus className="h-5 w-5" />
      <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
    </Button>
  );
}
