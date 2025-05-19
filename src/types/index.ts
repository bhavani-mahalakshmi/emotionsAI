
export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  emotion?: string; // Optional: For AI's emotion analysis result
  insights?: string; // Optional: For AI's insights
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  // Optional: could store a summary or overall mood later
  // summary?: string; 
}
