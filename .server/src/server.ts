import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  getLatestAISummary,
  saveAISummary,
  deleteTransaction,
  initDatabase,
} from "./db";
import { generateInsights } from "./groq";
import type { Transaction, AISummary } from "./types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

initDatabase().catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/transactions", (req, res) => {
  const status = req.query.status as string | undefined;
  const tag = req.query.tag as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

  const transactions = getTransactions({ status, tag, limit });
  res.json(transactions);
});

app.get("/api/transactions/:id", (req, res) => {
  const txn = getTransactionById(req.params.id);
  if (!txn) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  res.json(txn);
});

app.post("/api/transactions", (req, res) => {
  const body = req.body as Partial<Transaction>;

  if (!body.id || !body.name || body.amount === undefined || !body.direction || !body.date || !body.tag) {
    return res.status(400).json({ error: "Missing required fields: id, name, amount, direction, date, tag" });
  }

  const txn: Transaction = {
    id: body.id,
    name: body.name,
    initial: body.initial || "",
    avatarBg: body.avatarBg || "#eef0fb",
    avatarFg: body.avatarFg || "#372ee0",
    amount: body.amount,
    direction: body.direction,
    date: body.date,
    category: body.category,
    description: body.description,
    remark: body.remark,
    tag: body.tag,
    rawSms: body.rawSms,
    status: body.status || "unprocessed",
    processedAt: body.processedAt,
  };

  try {
    createTransaction(txn);
    res.status(201).json(txn);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create transaction", message: error.message });
  }
});

app.post("/api/transactions/:id/process", (req, res) => {
  const { tag, description } = req.body as { tag: "business" | "personal"; description?: string };

  if (!tag || (tag !== "business" && tag !== "personal")) {
    return res.status(400).json({ error: "Invalid tag. Must be 'business' or 'personal'" });
  }

  const existing = getTransactionById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  updateTransaction(req.params.id, {
    status: "processed",
    tag,
    description: description || existing.description,
    processedAt: new Date().toISOString(),
  });

  const updated = getTransactionById(req.params.id);
  res.json(updated);
});

app.delete("/api/transactions/:id", (req, res) => {
  const existing = getTransactionById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  deleteTransaction(req.params.id);
  res.status(204).send();
});

app.get("/api/ai/summary/latest", (_req, res) => {
  const summary = getLatestAISummary();
  if (!summary) {
    return res.status(404).json({ error: "No AI summary available yet" });
  }
  res.json(summary);
});

app.post("/api/ai/insights", async (req, res) => {
  try {
    const previousSummary = getLatestAISummary();

    const processedTxns = getTransactions({ status: "processed" });
    const businessTxns = processedTxns.filter((t) => t.tag === "business");

    const newTxns = req.body.newTransactions as {
      name: string;
      amount: number;
      direction: "credit" | "debit";
      date: string;
      tag: "business" | "personal";
      description?: string;
      rawSms?: string;
    }[];

    const currentBalances = req.body.currentBalances as Record<string, number> || {};

    const result = await generateInsights({
      previousSummary: previousSummary?.narrative || null,
      newTransactions: newTxns.length > 0 ? newTxns : businessTxns.map((t) => ({
        name: t.name,
        amount: t.amount,
        direction: t.direction,
        date: t.date,
        tag: t.tag,
        description: t.description || t.remark,
        rawSms: t.rawSms,
      })),
    });

    const summaryId = saveAISummary({
      narrative: result.narrative,
      insights: result.insights,
    });

    res.json({
      narrative: result.narrative,
      insights: result.insights,
      summaryId,
    });
  } catch (error: any) {
    console.error("AI insights error:", error);
    res.status(500).json({ error: "Failed to generate insights", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`KwachaWise server running on http://localhost:${PORT}`);
});
