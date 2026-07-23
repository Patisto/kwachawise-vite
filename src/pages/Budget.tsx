import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, MoreHorizontal, Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { categories } from "@/lib/data";
import { getProcessedTransactions } from "@/lib/db";
import type { Transaction } from "@/lib/types";

export default function BudgetPage() {
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [businessTxns, setBusinessTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProcessedTransactions()
      .then((all) => setBusinessTxns(all.filter((t: Transaction) => t.tag === "business" && t.direction === "debit")))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = businessTxns.reduce((sum, t) => sum + t.amount, 0);
  const budget = monthlyBudget ?? 500000;
  const remaining = budget - totalSpent;
  const percentUsed = Math.min(Math.round((totalSpent / budget) * 100), 100);

  const categorySpending = new Map<string, number>();
  businessTxns.forEach((t) => {
    if (t.category) {
      categorySpending.set(t.category, (categorySpending.get(t.category) || 0) + t.amount);
    }
  });

  if (loading) {
    return (
      <div className="relative flex h-full flex-col" style={{ background: "var(--kw-primary)" }}>
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col" style={{ background: "var(--kw-primary)" }}>
      <div className="px-5 pt-2">
        <div className="grid grid-cols-[36px_1fr_36px] items-center">
          <Link
            to="/"
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
          >
            <ChevronLeft size={18} color="#fff" />
          </Link>
          <h1 className="text-center text-[17px] font-semibold text-white">Budget</h1>
          <button
            aria-label="More options"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 justify-self-end"
          >
            <MoreHorizontal size={18} color="#fff" />
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center text-center">
          <p className="text-[13px] text-white/70">Monthly Budget</p>
          <p className="font-[family-name:var(--font-display)] text-[40px] font-extrabold text-white">
            {monthlyBudget ? `K${monthlyBudget.toLocaleString("en-US")}` : "Not Set"}
          </p>
          {!monthlyBudget && (
            <button
              onClick={() => setMonthlyBudget(500000)}
              className="mt-2 flex items-center gap-1 rounded-full bg-white/15 px-4 py-1.5 text-[13px] font-medium text-white"
            >
              <Plus size={14} />
              Set Budget
            </button>
          )}
        </div>
      </div>

      <div className="kw-scroll flex-1 overflow-y-auto rounded-t-[28px] bg-[var(--kw-bg)] px-5 pb-28 pt-6">
        {monthlyBudget ? (
          <>
            <div className="rounded-[22px] bg-white/10 p-5">
              <div className="flex items-center justify-between text-[13px] text-white/80">
                <span>Spent: K{totalSpent.toLocaleString("en-US")}</span>
                <span>Remaining: K{remaining.toLocaleString("en-US")}</span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-white/20">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${percentUsed}%`,
                    background: percentUsed > 90 ? "var(--kw-danger)" : percentUsed > 70 ? "var(--kw-orange)" : "var(--kw-success)",
                  }}
                />
              </div>
              <p className="mt-2 text-center text-[12px] text-white/70">
                {percentUsed}% used
              </p>
            </div>

            <div className="mt-6">
              <p className="text-[13px] font-medium text-white/60">By Category</p>
              <div className="mt-2 space-y-2">
                {Array.from(categorySpending.entries()).map(([key, amount]) => {
                  const cat = categories.find((c) => c.key === key);
                  if (!cat || cat.key === "uncategorized") return null;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{cat.emoji}</span>
                        <span className="text-[14px] font-medium text-white">
                          {cat.label}
                        </span>
                      </div>
                      <span className="text-[14px] font-semibold text-white">
                        K{amount.toLocaleString("en-US")}
                      </span>
                    </div>
                  );
                })}
                {categorySpending.size === 0 && (
                  <p className="text-center text-[13px] text-white/60 mt-4">
                    No categorized expenses yet
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl">🐷</div>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-[22px] font-bold text-[var(--kw-ink)]">
              Welcome
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--kw-muted)]">
              Set a monthly budget to track your business expenses and stay on top of your finances.
            </p>
          </div>
        )}
      </div>

      <BottomNav dark />
    </div>
  );
}
