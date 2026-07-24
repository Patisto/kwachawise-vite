import pg from "pg";
import type { Transaction, AISummary } from "./types";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      initial TEXT,
      avatar_bg TEXT,
      avatar_fg TEXT,
      amount REAL NOT NULL,
      direction TEXT NOT NULL CHECK(direction IN ('credit', 'debit')),
      date TEXT NOT NULL,
      category TEXT,
      description TEXT,
      remark TEXT,
      tag TEXT NOT NULL CHECK(tag IN ('business', 'personal')),
      raw_sms TEXT,
      status TEXT NOT NULL DEFAULT 'unprocessed' CHECK(status IN ('unprocessed', 'processed')),
      processed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_summaries (
      id SERIAL PRIMARY KEY,
      narrative TEXT NOT NULL,
      insights TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_txn_status ON transactions(status)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_txn_tag ON transactions(tag)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_txn_date ON transactions(date)`);
}

export async function getTransactions(filters?: { status?: string; tag?: string; limit?: number }): Promise<Transaction[]> {
  let sql = "SELECT * FROM transactions WHERE 1=1";
  const params: any[] = [];

  if (filters?.status) {
    sql += " AND status = $1";
    params.push(filters.status);
  }
  if (filters?.tag) {
    sql += " AND tag = $" + (params.length + 1);
    params.push(filters.tag);
  }
  sql += " ORDER BY date DESC";
  if (filters?.limit) {
    sql += " LIMIT $" + (params.length + 1);
    params.push(filters.limit);
  }

  const result = await pool.query(sql, params);
  return result.rows.map(rowToTransaction);
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  const result = await pool.query("SELECT * FROM transactions WHERE id = $1", [id]);
  if (result.rows.length === 0) return undefined;
  return rowToTransaction(result.rows[0]);
}

export async function createTransaction(txn: Transaction): Promise<void> {
  await pool.query(`
    INSERT INTO transactions (
      id, name, initial, avatar_bg, avatar_fg,
      amount, direction, date, category, description, remark, tag, raw_sms, status, processed_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
  `, [
    txn.id,
    txn.name,
    txn.initial || null,
    txn.avatarBg || null,
    txn.avatarFg || null,
    txn.amount,
    txn.direction,
    txn.date,
    txn.category || null,
    txn.description || null,
    txn.remark || null,
    txn.tag,
    txn.rawSms || null,
    txn.status,
    txn.processedAt || null,
  ]);
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (updates.status !== undefined) { fields.push(`status = $${paramIndex++}`); params.push(updates.status); }
  if (updates.processedAt !== undefined) { fields.push(`processed_at = $${paramIndex++}`); params.push(updates.processedAt); }
  if (updates.tag !== undefined) { fields.push(`tag = $${paramIndex++}`); params.push(updates.tag); }
  if (updates.category !== undefined) { fields.push(`category = $${paramIndex++}`); params.push(updates.category); }
  if (updates.description !== undefined) { fields.push(`description = $${paramIndex++}`); params.push(updates.description); }
  if (updates.direction !== undefined) { fields.push(`direction = $${paramIndex++}`); params.push(updates.direction); }

  if (fields.length > 0) {
    params.push(id);
    await pool.query(`UPDATE transactions SET ${fields.join(", ")} WHERE id = $${paramIndex}`, params);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  await pool.query("DELETE FROM transactions WHERE id = $1", [id]);
}

export async function getLatestAISummary(): Promise<AISummary | undefined> {
  const result = await pool.query("SELECT * FROM ai_summaries ORDER BY created_at DESC LIMIT 1");
  if (result.rows.length === 0) return undefined;
  const row = result.rows[0];
  return {
    id: row.id,
    narrative: row.narrative,
    insights: JSON.parse(row.insights),
    createdAt: row.created_at,
  };
}

export async function saveAISummary(summary: { narrative: string; insights: string[] }): Promise<number> {
  const result = await pool.query(
    "INSERT INTO ai_summaries (narrative, insights) VALUES ($1, $2) RETURNING id",
    [summary.narrative, JSON.stringify(summary.insights)]
  );
  return result.rows[0].id;
}

export async function initDatabase(): Promise<void> {
  await initDb();
}

function rowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    name: row.name,
    initial: row.initial || "",
    avatarBg: row.avatar_bg || "#eef0fb",
    avatarFg: row.avatar_fg || "#372ee0",
    amount: parseFloat(row.amount),
    direction: row.direction,
    date: row.date,
    category: row.category,
    description: row.description,
    remark: row.remark,
    tag: row.tag,
    rawSms: row.raw_sms,
    status: row.status,
    processedAt: row.processed_at,
  };
}
