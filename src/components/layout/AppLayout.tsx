
"use client";
import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ConversationList from '@/components/chat/ConversationList';
import NewChatButton from '@/components/chat/NewChatButton';
import ChatArea from '@/components/chat/ChatArea';
import { BrainCircuit } from 'lucide-react'; 
import { Separator } from '@/components/ui/separator';

export default function AppLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar 
        variant="sidebar" 
        collapsible="icon" 
        className="border-r border-sidebar-border shadow-md"
      >
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <BrainCircuit className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
              Emotion Insights
            </h1>
          </div>
        </SidebarHeader>
        <Separator className="bg-sidebar-border group-data-[collapsible=icon]:hidden" />
        <SidebarContent className="p-2">
          <NewChatButton />
          <ConversationList />
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto">
          {/* Footer content if any, e.g., settings, user profile */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-background">
        <header className="p-4 border-b border-border md:hidden flex items-center justify-between sticky top-0 bg-background z-10">
           <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              Emotion Insights
            </h1>
          </div>
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-y-auto">
          <ChatArea />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
