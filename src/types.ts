export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  analysis?: {
    emotionalTone: string;
    insights: string;
    possibleReasons: string[];
    suggestions: string[];
    followUpQuestions: string[];
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
} 