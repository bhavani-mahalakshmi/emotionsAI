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
import { MessageSquare, Settings, UserCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function AppLayout() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <SidebarProvider defaultOpen={true}>
        <Sidebar 
          variant="sidebar" 
          collapsible="icon" 
          className="border-r border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60"
        >
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-data-[collapsible=icon]:hidden">
                Emotion Insights
              </h1>
            </div>
          </SidebarHeader>
          <Separator className="bg-gray-200 dark:bg-gray-800" />
          <SidebarContent className="p-2">
            <NewChatButton />
            <ConversationList />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <UserCircle className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Profile</span>
              </Button>
              <Button variant="ghost" className="justify-start gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-hidden">
          <ChatArea />
        </main>
      </SidebarProvider>
    </div>
  );
}
