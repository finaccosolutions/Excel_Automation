export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  vbaCode?: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  geminiApiKey?: string;
}