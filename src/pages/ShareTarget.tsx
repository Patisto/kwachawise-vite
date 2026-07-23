import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Share2, ClipboardPaste } from "lucide-react";
import { parseSMS } from "@/lib/parseSMS";
import { createTransaction } from "@/lib/db";
import type { Transaction } from "@/lib/types";
import BottomNav from "@/components/BottomNav";

export default function ShareTargetPage() {
  const [params] = useSearchParams();
  const sharedText = params.get("text") || params.get("title") || "";
  const [manualText, setManualText] = useState("");
  const [method, setMethod] = useState(sharedText ? "auto" : "manual");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const rawText = method === "auto" ? sharedText : manualText;
  const txn = useMemo(() => parseSMS(rawText), [rawText]);

  const initials = useMemo(() => {
    if (!txn.recipientSender || txn.recipientSender === "Unknown") return "?";
    return txn.recipientSender
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [txn.recipientSender]);

  const handleSave = async (tag: "business" | "personal") => {
    if (!rawText.trim()) return;
    setError("");

    const newTxn: Transaction = {
      id: `sms_${Date.now()}`,
      name: txn.recipientSender || "Unknown",
      initial: initials,
      avatarBg: "#eef0fb",
      avatarFg: "#372ee0",
      amount: txn.amount || 0,
      direction: txn.direction === "deposit" || txn.direction === "received" ? "credit" : "debit",
      date: new Date().toISOString(),
      group: "Today",
      category: "uncategorized",
      description: txn.rawText,
      tag,
      rawSms: txn.rawText,
      status: "unprocessed",
    };

    try {
      await createTransaction(newTxn);
      setSaved(true);
    } catch {
      setError("Failed to save. Please try again.");
    }
  };

  if (saved) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-5" style={{ background: "var(--kw-primary)" }}>
        <div className="w-full max-w-sm rounded-[28px] bg-white p-7 text-center shadow-lg">
          <div className="text-5xl">✅</div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[22px] font-extrabold text-[var(--kw-ink)]">
            Saved!
          </h1>
          <p className="mt-2 text-[14px] text-[var(--kw-muted)]">
            This SMS is saved and waiting to be sorted as <strong>{txn.recipientSender || "Unknown"}</strong>.
          </p>
          <Link
            to="/sort"
            className="mt-6 inline-block rounded-full bg-[var(--kw-primary)] px-8 py-3 text-[15px] font-bold text-white"
          >
            Sort Messages
          </Link>
          <Link
            to="/"
            className="mt-3 block text-[13px] font-medium text-[var(--kw-muted)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-5" style={{ background: "var(--kw-primary)" }}>
      <div className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--kw-primary)]/10">
            <Share2 size={24} color="var(--kw-primary)" />
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[20px] font-extrabold text-[var(--kw-ink)]">
            Add Transaction
          </h1>
          <p className="mt-1 text-[13px] text-[var(--kw-muted)]">
            Share an SMS or paste it manually
          </p>
        </div>

        {error && (
          <p className="mt-3 text-center text-[13px] text-[var(--kw-danger)]">{error}</p>
        )}

        {method === "auto" ? (
          <div className="mt-6 rounded-2xl bg-[var(--kw-bg)] p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-bold"
                style={{ background: "#eef0fb", color: "#372ee0" }}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-[var(--kw-ink)]">
                  {txn.recipientSender || "Unknown"}
                </p>
                <p className="text-[12px] text-[var(--kw-muted)]">
                  {txn.direction === "deposit" ? "Deposit" : txn.direction}
                </p>
              </div>
              <p className="text-[16px] font-bold text-[var(--kw-ink)]">
                {txn.amount ? `K${txn.amount.toLocaleString()}` : "—"}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <label className="text-[13px] font-semibold text-[var(--kw-ink)]">Paste your SMS message</label>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste your transaction SMS here..."
              className="mt-2 h-32 w-full rounded-2xl border border-[var(--kw-line)] bg-[var(--kw-bg)] p-4 text-[14px] text-[var(--kw-ink)] outline-none placeholder:text-[var(--kw-muted-soft)]"
            />
            {manualText && (
              <div className="mt-3 rounded-2xl bg-[var(--kw-bg)] p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-bold"
                    style={{ background: "#eef0fb", color: "#372ee0" }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-[var(--kw-ink)]">
                      {txn.recipientSender || "Unknown"}
                    </p>
                    <p className="text-[12px] text-[var(--kw-muted)]">
                      {txn.direction === "deposit" ? "Deposit" : txn.direction}
                    </p>
                  </div>
                  <p className="text-[16px] font-bold text-[var(--kw-ink)]">
                    {txn.amount ? `K${txn.amount.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <p className="text-[13px] font-semibold text-[var(--kw-ink)]">Is this for Business or Personal?</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSave("business")}
              disabled={!rawText.trim()}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-[var(--kw-primary)] bg-[var(--kw-primary)]/5 p-4 transition-colors hover:bg-[var(--kw-primary)]/10 disabled:opacity-40"
            >
              <span className="text-2xl">💼</span>
              <span className="text-[13px] font-semibold text-[var(--kw-primary)]">Business</span>
            </button>
            <button
              onClick={() => handleSave("personal")}
              disabled={!rawText.trim()}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-[var(--kw-muted-soft)] bg-white p-4 transition-colors hover:bg-[var(--kw-bg)] disabled:opacity-40"
            >
              <span className="text-2xl">🏠</span>
              <span className="text-[13px] font-semibold text-[var(--kw-muted)]">Personal</span>
            </button>
          </div>
        </div>

        {method === "auto" && (
          <button
            onClick={() => setMethod("manual")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--kw-bg)] py-3 text-[13px] font-medium text-[var(--kw-muted)]"
          >
            <ClipboardPaste size={16} />
            Paste manually instead
          </button>
        )}
      </div>
      <BottomNav dark />
    </div>
  );
}
