import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { getUnprocessedTransactions, processTransaction } from "@/lib/db";
import type { Transaction } from "@/lib/types";
import BottomNav from "@/components/BottomNav";

export default function SortPage() {
  const [queue, setQueue] = useState<Transaction[]>([]);
  const [index, setIndex] = useState(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedCount, setSavedCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    getUnprocessedTransactions()
      .then(setQueue)
      .catch(() => setError("Failed to load messages"))
      .finally(() => setLoading(false));
  }, []);

  const current = queue[index];
  const done = index >= queue.length;

  const handleTag = async (tag: "business" | "personal") => {
    if (!current) return;
    try {
      await processTransaction(current.id, tag, description);
      setSavedCount((c) => c + 1);
      setDescription("");
      setIndex((i) => i + 1);
    } catch {
      setError("Failed to save. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center" style={{ background: "var(--kw-primary)" }}>
        <Loader2 size={28} color="#fff" className="animate-spin" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-8 text-center" style={{ background: "var(--kw-primary)" }}>
        <div className="text-5xl">🎉</div>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-[24px] font-extrabold text-[var(--kw-primary)]">
          All sorted!
        </h1>
        <p className="mt-2 text-[14px] text-[var(--kw-muted)]">
          You sorted {savedCount} transactions. Your ledger is now up to date.
        </p>

        <div className="mt-8 w-full space-y-3">
          <Link
            to="/insights"
            className="block w-full rounded-full bg-[var(--kw-primary)] py-4 text-[15px] font-bold text-white"
          >
            View Insights
          </Link>
          <Link
            to="/"
            className="block w-full rounded-full border border-[var(--kw-line)] bg-white py-3.5 text-[14px] font-medium text-[var(--kw-ink)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col" style={{ background: "var(--kw-primary)" }}>
      <div className="px-5 pt-2">
        <div className="grid grid-cols-[36px_1fr_36px] items-center">
          <Link
            to="/"
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
          >
            <ChevronLeft size={18} color="#fff" />
          </Link>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-white">Sort Messages</p>
            <p className="text-[11.5px] text-white/60">{index + 1} of {queue.length}</p>
          </div>
          <span />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-28">
        {error && (
          <div className="mb-4 rounded-2xl bg-red-50/20 p-3 text-center text-[13px] text-white">
            {error}
          </div>
        )}
        <div className="rounded-[28px] border border-white/10 bg-white p-5 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[15px] font-bold"
                style={{ background: current.avatarBg, color: current.avatarFg }}
              >
                {current.initial}
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[var(--kw-ink)]">{current.name}</p>
                <p className="text-[12.5px] text-[var(--kw-muted)]">
                  {new Date(current.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
            <p className="text-[17px] font-bold text-[var(--kw-ink)]">
              {current.direction === "credit" ? "+" : "-"}K{current.amount.toLocaleString("en-US")}
            </p>
          </div>

          {current.rawSms && (
            <div className="mt-4 rounded-2xl bg-[var(--kw-bg)] p-4">
              <p className="text-[11px] font-medium text-[var(--kw-muted)]">ORIGINAL SMS</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--kw-ink)]">{current.rawSms}</p>
            </div>
          )}

          <div className="mt-4">
            <label className="text-[13px] font-semibold text-[var(--kw-ink)]">Add note (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., daily sales, school fees, etc."
              className="mt-2 h-20 w-full rounded-2xl border border-[var(--kw-line)] bg-[var(--kw-bg)] p-4 text-[14px] text-[var(--kw-ink)] outline-none placeholder:text-[var(--kw-muted-soft)]"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTag("business")}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-[var(--kw-primary)] bg-[var(--kw-primary)]/5 p-5 transition-colors hover:bg-[var(--kw-primary)]/10"
            >
              <span className="text-2xl">💼</span>
              <span className="text-[14px] font-bold text-[var(--kw-primary)]">Business</span>
            </button>
            <button
              onClick={() => handleTag("personal")}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-[var(--kw-muted-soft)] bg-white p-5 transition-colors hover:bg-[var(--kw-bg)]"
            >
              <span className="text-2xl">🏠</span>
              <span className="text-[14px] font-bold text-[var(--kw-muted)]">Personal</span>
            </button>
          </div>
        </div>
      </div>
      <BottomNav dark />
    </div>
  );
}
