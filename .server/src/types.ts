export interface Transaction {
  id: string;
  name: string;
  initial: string;
  avatarBg: string;
  avatarFg: string;
  amount: number;
  direction: "credit" | "debit";
  date: string;
  category?: string;
  description?: string;
  remark?: string;
  faded?: boolean;
  tag: "business" | "personal";
  rawSms?: string;
  status: "unprocessed" | "processed";
  processedAt?: string;
}

export interface AISummary {
  id: number;
  narrative: string;
  insights: string[];
  createdAt: string;
}

export interface AIInsightResponse {
  narrative: string;
  insights: string[];
  summary: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
