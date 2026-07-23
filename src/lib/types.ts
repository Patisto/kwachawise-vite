export type CategoryKey =
  | "eating-out"
  | "utilities"
  | "transport"
  | "shopping"
  | "salary"
  | "transfer"
  | "uncategorized";

export interface Category {
  key: CategoryKey;
  label: string;
  emoji: string;
  colorBg: string;
  colorFg: string;
}

export interface Transaction {
  id: string;
  name: string;
  initial: string;
  avatarBg: string;
  avatarFg: string;
  amount: number;
  direction: "credit" | "debit";
  date: string; // ISO
  group: string;
  category?: CategoryKey;
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
  balances: Record<string, number>;
  insights: string[];
  createdAt: string;
}
