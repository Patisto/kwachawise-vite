import type { AIInsightResponse } from "./types";

export async function generateInsights(params: {
  previousSummary: string | null;
  newTransactions: {
    name: string;
    amount: number;
    direction: "credit" | "debit";
    date: string;
    tag: "business" | "personal";
    description?: string;
    rawSms?: string;
  }[];
}): Promise<AIInsightResponse> {
  const { default: Groq } = await import("groq-sdk");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

  const systemPrompt = `You are KwachaWise, an AI financial assistant for small business owners in Malawi. Your job is to analyze business transactions and provide actionable insights.

**CRITICAL RULES:**
1. Respond ONLY with valid JSON. No markdown, no code fences.
2. The JSON must have exactly these keys:
   {
     "narrative": "string",
     "insights": [string],
     "summary": "string"
   }
3. narrative: A warm, 1-2 sentence summary of current business cash position for the user.
4. insights: Array of 3 short, specific, actionable insights about spending patterns, cash flow, or recommendations.
5. summary: A detailed private narrative (not shown to user) that records transaction context, spending patterns, and business health trends. This will be used as context for future AI calls.

**Malawian SMS transaction patterns:**
- Airtel Money: receipts say "You have received", payments say "Cash Out", "sent to", "payment to". Usually includes Ref, Fee, Levy, Balance/New Bal.
- FDH Bank: bank transfers say "Account X has sent / received", includes Fee, Narr, Ref, Bal. Often TID reference.
- NBM: similar to FDH, includes account numbers, Fee, Ref, Bal.
- Amounts are in MWK (Malawi Kwacha). Fees and Levies are separate from the main amount.
- "Cash Out" = withdrawal/debit
- "You have received" or "deposited" = credit
- Transfers to named people = debit
- Bank transfers from one account to another = debit for sender, credit for receiver

**Business context:**
- User operates a small business in Malawi
- Transactions tagged "business" affect the business ledger
- Transactions tagged "personal" should be mentioned but excluded from business calculations
- Main currencies: MWK (Malawi Kwacha)
- Fees and levies are costs that reduce the actual received amount`;

  const userPrompt = buildUserPrompt(params);

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content) as AIInsightResponse;

    return {
      narrative: parsed.narrative || "Your business finances are stable.",
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      summary: parsed.summary || content,
    };
  } catch (error) {
    console.error("Groq API error:", error);
    return {
      narrative: "Your business finances are stable.",
      insights: ["Keep tracking your transactions for better insights."],
      summary: params.previousSummary || "No previous summary available.",
    };
  }
}

function buildUserPrompt(params: {
  previousSummary: string | null;
  newTransactions: {
    name: string;
    amount: number;
    direction: "credit" | "debit";
    date: string;
    tag: "business" | "personal";
    description?: string;
    rawSms?: string;
  }[];
}): string {
  const lines: string[] = [];

  lines.push("# KwachaWize AI Analysis Request");
  lines.push("");

  if (params.previousSummary) {
    lines.push("## Previous Business Summary");
    lines.push(params.previousSummary);
    lines.push("");
  }

  const businessTxns = params.newTransactions.filter((t) => t.tag === "business");
  const personalTxns = params.newTransactions.filter((t) => t.tag === "personal");

  if (businessTxns.length > 0) {
    lines.push("## New Business Transactions");
    for (const t of businessTxns) {
      const details = [t.name];
      if (t.description) details.push(t.description);
      if (t.rawSms) details.push(`SMS: ${t.rawSms.slice(0, 120)}`);
      lines.push(`- ${t.date}: ${t.direction === "credit" ? "+" : "-"}K${t.amount.toLocaleString()} | ${details.join(" | ")}`);
    }
    lines.push("");
  }

  if (personalTxns.length > 0) {
    lines.push("## Personal Transactions (excluded from business ledger)");
    for (const t of personalTxns) {
      const details = [t.name];
      if (t.rawSms) details.push(`SMS: ${t.rawSms.slice(0, 120)}`);
      lines.push(`- ${t.date}: ${t.direction === "credit" ? "+" : "-"}K${t.amount.toLocaleString()} | ${details.join(" | ")}`);
    }
    lines.push("");
  }

  lines.push("## Task");
  lines.push(
    "Generate a brief narrative about business cash flow, 3 actionable insights, and an updated detailed private summary."
  );
  lines.push("");
  lines.push("## Required Output Format");
  lines.push('Respond with JSON: { "narrative": "...", "insights": [...], "summary": "..." }');

  return lines.join("\n");
}
