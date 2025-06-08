"use client";

import { ConversationsProvider } from "@/context/ConversationsContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <ConversationsProvider>{children}</ConversationsProvider>;
}
