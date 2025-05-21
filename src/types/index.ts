export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  emotion?: string; // Optional: For AI's emotion analysis result
  insights?: string; // Optional: For AI's insights
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
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
  // Optional: could store a summary or overall mood later
  // summary?: string; 
}

export interface Analysis {
  emotionalTone: string;
  insights: string;
  possibleReasons: string[];
  suggestions: string[];
}
