import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import type { Transaction, AISummary } from "./types";

declare const require: any;

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

const DB_PATH = process.env.DB_PATH || "./kwachawise.db";

async function getDb(): Promise<Database> {
  if (db) return db;

  if (!SQL) {
    SQL = await initSqlJs({ locateFile: (file) => `./node_modules/sql.js/dist/${file}` });
  }

  db = new SQL.Database();
  initDb(db);
  await loadFromDisk();
  return db;
}

function initDb(database: Database) {
  database.run(`
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

  database.run(`
    CREATE TABLE IF NOT EXISTS ai_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      narrative TEXT NOT NULL,
      insights TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`CREATE INDEX IF NOT EXISTS idx_txn_status ON transactions(status)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_txn_tag ON transactions(tag)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_txn_date ON transactions(date)`);
}

async function loadFromDisk() {
  try {
    const fs = await import("fs");
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      if (db && buffer.length > 0) {
        db.close();
      }
      if (buffer.length > 0 && SQL) {
        db = new SQL.Database(new Uint8Array(buffer));
      }
    }
  } catch {
    // ignore
  }
}

async function saveToDisk() {
  try {
    const fs = await import("fs");
    if (db) {
      const data = db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    }
  } catch {
    // ignore
  }
}

export function getTransactions(filters?: { status?: string; tag?: string; limit?: number }): Transaction[] {
  if (!db) throw new Error("Database not initialized");
  let sql = "SELECT * FROM transactions WHERE 1=1";
  const params: any[] = [];

  if (filters?.status) {
    sql += " AND status = ?";
    params.push(filters.status);
  }
  if (filters?.tag) {
    sql += " AND tag = ?";
    params.push(filters.tag);
  }
  sql += " ORDER BY datetime(date) DESC";
  if (filters?.limit) {
    sql += " LIMIT ?";
    params.push(filters.limit);
  }

  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: Transaction[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    results.push(rowToTransaction(row));
  }
  stmt.free();
  return results;
}

export function getTransactionById(id: string): Transaction | undefined {
  if (!db) throw new Error("Database not initialized");
  const stmt = db.prepare("SELECT * FROM transactions WHERE id = ?");
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.getAsObject() as any;
    stmt.free();
    return rowToTransaction(row);
  }
  stmt.free();
  return undefined;
}

export function createTransaction(txn: Transaction): void {
  if (!db) throw new Error("Database not initialized");
  db.run(`
    INSERT INTO transactions (
      id, name, initial, avatar_bg, avatar_fg,
      amount, direction, date, category, description, remark, tag, raw_sms, status, processed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  saveToDisk();
}

export function updateTransaction(id: string, updates: Partial<Transaction>): void {
  if (!db) throw new Error("Database not initialized");
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.status !== undefined) { fields.push("status = ?"); params.push(updates.status); }
  if (updates.processedAt !== undefined) { fields.push("processed_at = ?"); params.push(updates.processedAt); }
  if (updates.tag !== undefined) { fields.push("tag = ?"); params.push(updates.tag); }
  if (updates.category !== undefined) { fields.push("category = ?"); params.push(updates.category); }
  if (updates.description !== undefined) { fields.push("description = ?"); params.push(updates.description); }
  if (updates.direction !== undefined) { fields.push("direction = ?"); params.push(updates.direction); }

  if (fields.length > 0) {
    params.push(id);
    db.run(`UPDATE transactions SET ${fields.join(", ")} WHERE id = ?`, params);
    saveToDisk();
  }
}

export function deleteTransaction(id: string): void {
  if (!db) throw new Error("Database not initialized");
  db.run("DELETE FROM transactions WHERE id = ?", [id]);
  saveToDisk();
}

export function getLatestAISummary(): AISummary | undefined {
  if (!db) throw new Error("Database not initialized");
  const stmt = db.prepare("SELECT * FROM ai_summaries ORDER BY created_at DESC LIMIT 1");
  if (stmt.step()) {
    const row = stmt.getAsObject() as any;
    stmt.free();
    return {
      id: row.id,
      narrative: row.narrative,
      insights: JSON.parse(row.insights),
      createdAt: row.created_at,
    };
  }
  stmt.free();
  return undefined;
}

export function saveAISummary(summary: { narrative: string; insights: string[] }): number {
  if (!db) throw new Error("Database not initialized");
  const result = db.run(
    "INSERT INTO ai_summaries (narrative, insights) VALUES (?, ?)",
    [summary.narrative, JSON.stringify(summary.insights)]
  );
  saveToDisk();
  return result.lastInsertRowid as number;
}

export async function initDatabase(): Promise<Database> {
  return getDb();
}

function rowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    name: row.name,
    initial: row.initial || "",
    avatarBg: row.avatar_bg || "#eef0fb",
    avatarFg: row.avatar_fg || "#372ee0",
    amount: row.amount,
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
