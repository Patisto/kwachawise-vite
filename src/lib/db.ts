import type { Transaction, AISummary } from "./types";

const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    const error = new Error(`HTTP ${res.status}: ${text || res.statusText}`) as any;
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export async function getTransactions(filters?: { status?: string; tag?: string; limit?: number }): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.tag) params.set("tag", filters.tag);
  if (filters?.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return request<Transaction[]>(`/transactions${qs ? `?${qs}` : ""}`);
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  return request<Transaction>(`/transactions/${encodeURIComponent(id)}`);
}

export async function createTransaction(txn: Partial<Transaction>): Promise<Transaction> {
  return request<Transaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(txn),
  });
}

export async function updateTransactionApi(id: string, updates: Partial<Transaction>): Promise<Transaction> {
  return request<Transaction>(`/transactions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function deleteTransactionApi(id: string): Promise<void> {
  await request<void>(`/transactions/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function processTransaction(id: string, tag: "business" | "personal", description?: string): Promise<Transaction> {
  return request<Transaction>(`/transactions/${encodeURIComponent(id)}/process`, {
    method: "POST",
    body: JSON.stringify({ tag, description }),
  });
}

export async function getProcessedTransactions(): Promise<Transaction[]> {
  return getTransactions({ status: "processed" });
}

export async function getUnprocessedTransactions(): Promise<Transaction[]> {
  return getTransactions({ status: "unprocessed" });
}

export async function getLatestAISummary(): Promise<AISummary | undefined> {
  return request<AISummary | undefined>("/ai/summary/latest").catch(() => undefined);
}

export async function generateInsights(params: {
  previousSummary?: string | null;
  previousBalances?: Record<string, number>;
  newTransactions?: Transaction[];
  currentBalances?: Record<string, number>;
}): Promise<{
  narrative: string;
  balances: Record<string, number>;
  insights: string[];
  summaryId: number;
}> {
  const body = {
    previousSummary: params.previousSummary ?? null,
    previousBalances: params.previousBalances ?? {},
    newTransactions: params.newTransactions ?? [],
    currentBalances: params.currentBalances ?? {},
  };
  return request<{ narrative: string; balances: Record<string, number>; insights: string[]; summaryId: number }>("/ai/insights", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
