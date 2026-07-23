export interface ParsedTransaction {
  transactionId: string | null;
  amount: number | null;
  recipientSender: string | null;
  direction: "sent" | "received" | "deposit" | "withdrawal" | "unknown";
  dateTime: string;
  rawText: string;
}

const DIRECTION_PATTERNS: [ParsedTransaction["direction"], RegExp][] = [
  ["deposit", /deposit(ed)?/i],
  ["withdrawal", /withdraw(al|n)?|cash[- ]?out/i],
  ["received", /received|you have received/i],
  ["sent", /sent|you have sent|payment to/i],
];

export function parseSMS(rawText: string): ParsedTransaction {
  const direction = DIRECTION_PATTERNS.find(([, re]) => re.test(rawText))?.[0] ?? "unknown";

  const amountMatch = rawText.match(/(?:MWK|MK|MKW)\s*([\d,]+(?:\.\d{2})?)/i);
  const txnIdMatch = rawText.match(/(?:Txn ID|Ref|ID)[:\s]+([A-Za-z0-9.\-]+)/i);
  const recipientMatch = rawText.match(
    /(?:to|from|at agent)\s+([A-Z0-9\s]{3,40}?)(?=\s+(?:on|Txn|Ref|New Bal|\.|$))/i
  );

  return {
    transactionId: txnIdMatch?.[1] ?? null,
    amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null,
    recipientSender: recipientMatch?.[1]?.trim() ?? "Unknown",
    direction,
    dateTime: new Date().toISOString(),
    rawText,
  };
}
