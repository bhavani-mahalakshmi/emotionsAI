
import AppLayout from "@/components/layout/AppLayout";
import { ConversationsProvider } from "@/context/ConversationsContext";

export default function Home() {
  return (
    <ConversationsProvider>
      <AppLayout />
    </ConversationsProvider>
  );
}
