import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, SlidersHorizontal, Search, Briefcase, Home, Clock } from "lucide-react";
import TransactionRow from "@/components/TransactionRow";
import BottomNav from "@/components/BottomNav";
import FilterSheet from "@/components/FilterSheet";
import { getProcessedTransactions, getUnprocessedTransactions } from "@/lib/db";
import type { Transaction } from "@/lib/types";

type TabFilter = "all" | "business" | "personal" | "unprocessed";

export default function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [tab, setTab] = useState<TabFilter>("all");
  const [processed, setProcessed] = useState<Transaction[]>([]);
  const [unprocessed, setUnprocessed] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProcessedTransactions(), getUnprocessedTransactions()])
      .then(([p, u]) => {
        setProcessed(p);
        setUnprocessed(u);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allTxns = useMemo(() => {
    return [...processed].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [processed]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let result = allTxns.filter((t) => t.name.toLowerCase().includes(q));

    if (tab === "business") {
      result = result.filter((t) => t.tag === "business");
    } else if (tab === "personal") {
      result = result.filter((t) => t.tag === "personal");
    } else if (tab === "unprocessed") {
      result = unprocessed.filter((t) => t.name.toLowerCase().includes(q));
    }

    return result;
  }, [allTxns, unprocessed, query, tab]);

  const transactionGroups = ["Today", "Yesterday"].map((g) => ({
    label: g,
    items: filtered.filter((t) => {
      const d = new Date(t.date);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const isYesterday = new Date(now.getTime() - 86400000).toDateString() === d.toDateString();
      return g === "Today" ? isToday : isYesterday;
    }),
  }));

  if (loading) {
    return (
      <div className="relative flex h-full flex-col bg-[var(--kw-bg)]">
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--kw-primary)]/20 border-t-[var(--kw-primary)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col" style={{ background: "var(--kw-primary)" }}>
      <div className="px-5 pt-2">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
          >
            <ChevronLeft size={18} color="#fff" />
          </Link>
          <h1 className="text-[16px] font-semibold text-white">Transactions</h1>
          <button
            onClick={() => setFilterOpen(true)}
            aria-label="Open filters"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
          >
            <SlidersHorizontal size={16} color="#fff" />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-full bg-white/10 px-4 py-3">
          <Search size={17} color="rgba(255,255,255,0.7)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions"
            className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-white/50"
          />
        </div>

        <div className="mt-3 flex rounded-full bg-white/10 p-1">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 rounded-full py-2 text-[13px] font-medium transition-colors ${
              tab === "all" ? "bg-white text-[var(--kw-primary)]" : "text-white/70"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab("business")}
            className={`flex items-center justify-center gap-1 rounded-full py-2 text-[13px] font-medium transition-colors ${
              tab === "business" ? "bg-white text-[var(--kw-primary)]" : "text-white/70"
            }`}
          >
            <Briefcase size={14} />
            <span>Business</span>
          </button>
          <button
            onClick={() => setTab("personal")}
            className={`flex items-center justify-center gap-1 rounded-full py-2 text-[13px] font-medium transition-colors ${
              tab === "personal" ? "bg-white text-[var(--kw-primary)]" : "text-white/70"
            }`}
          >
            <Home size={14} />
            <span>Personal</span>
          </button>
          {unprocessed.length > 0 && (
            <button
              onClick={() => setTab("unprocessed")}
              className={`flex items-center justify-center gap-1 rounded-full py-2 text-[13px] font-medium transition-colors ${
                tab === "unprocessed" ? "bg-white text-[var(--kw-primary)]" : "text-white/70"
              }`}
            >
              <Clock size={14} />
              <span>New ({unprocessed.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="kw-scroll flex-1 overflow-y-auto px-5 pb-28 pt-4">
        {transactionGroups.map(
          (group) =>
            group.items.length > 0 && (
              <div key={group.label}>
                <p className="mb-1 text-[13px] font-medium text-[var(--kw-muted)]">
                  {group.label}
                </p>
                <div className="divide-y divide-[var(--kw-line)]">
                  {group.items.map((t) => (
                    <TransactionRow key={t.id} txn={t} />
                  ))}
                </div>
              </div>
            )
        )}

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-[13.5px] text-[var(--kw-muted)]">
            No transactions match your filters.
          </p>
        )}
      </div>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
      <BottomNav dark />
    </div>
  );
}
