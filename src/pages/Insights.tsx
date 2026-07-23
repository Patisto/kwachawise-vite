import { useMemo, useState, useEffect } from "react";
import { PieChart as PieIcon, TrendingUp, TrendingDown } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { categories } from "@/lib/data";
import { getProcessedTransactions } from "@/lib/db";
import type { Transaction } from "@/lib/types";

export default function InsightsPage() {
  const [businessTxns, setBusinessTxns] = useState<Transaction[]>([]);

  useEffect(() => {
    getProcessedTransactions()
      .then((all) => setBusinessTxns(all.filter((t: Transaction) => t.tag === "business")))
      .catch(() => {});
  }, []);

  const income = businessTxns
    .filter((t) => t.direction === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = businessTxns
    .filter((t) => t.direction === "debit")
    .reduce((sum, t) => sum + t.amount, 0);
  const profit = income - expenses;

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    businessTxns
      .filter((t) => t.direction === "debit" && t.category)
      .forEach((t) => {
        map.set(t.category!, (map.get(t.category!) || 0) + t.amount);
      });
    return Array.from(map.entries())
      .map(([key, amount]) => ({
        category: categories.find((c) => c.key === key) ?? categories.find((c) => c.key === "uncategorized")!,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [businessTxns]);

  const maxCategory = categoryBreakdown[0]?.amount || 1;

  return (
    <div className="relative flex h-full flex-col" style={{ background: "var(--kw-primary)" }}>
      <div className="px-5 pt-2">
        <h1 className="text-center font-[family-name:var(--font-display)] text-[20px] font-bold text-white">
          Insights
        </h1>

        <div
          className="mt-5 flex items-center gap-4 rounded-[22px] p-4"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3b82f6]">
            <PieIcon size={18} color="#fff" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-white">Business Health</p>
            <p className="text-[12px] text-white/60">
              {businessTxns.length} transactions tracked
            </p>
          </div>
          <div className="text-right">
            <p className="text-[16px] font-bold text-white">
              {profit >= 0 ? `+K${profit.toLocaleString("en-US")}` : `-K${Math.abs(profit).toLocaleString("en-US")}`}
            </p>
            <p className="text-[12px] font-medium text-emerald-400">Net profit</p>
          </div>
        </div>
      </div>

      <div className="kw-scroll mt-5 flex-1 overflow-y-auto rounded-t-[28px] bg-[var(--kw-bg)] px-5 pb-28 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <TrendingUp size={16} color="var(--kw-success)" />
              </div>
              <p className="text-[13px] text-[var(--kw-muted)]">Income</p>
            </div>
            <p className="mt-2 text-[18px] font-bold text-[var(--kw-success)]">
              K{income.toLocaleString("en-US")}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <TrendingDown size={16} color="var(--kw-danger)" />
              </div>
              <p className="text-[13px] text-[var(--kw-muted)]">Expenses</p>
            </div>
            <p className="mt-2 text-[18px] font-bold text-[var(--kw-danger)]">
              K{expenses.toLocaleString("en-US")}
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-[15px] font-semibold text-[var(--kw-ink)]">Expense Breakdown</h2>

        <div className="mt-4 space-y-3">
          {categoryBreakdown.map(({ category, amount }) => (
            <div key={category.key} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                    style={{ background: category.colorBg }}
                  >
                    {category.emoji}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--kw-ink)]">
                      {category.label}
                    </p>
                    <p className="text-[12px] text-[var(--kw-muted)]">
                      {Math.round((amount / expenses) * 100)}% of expenses
                    </p>
                  </div>
                </div>
                <p className="text-[14px] font-bold text-[var(--kw-ink)]">
                  K{amount.toLocaleString("en-US")}
                </p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[var(--kw-bg)]">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${(amount / maxCategory) * 100}%`, background: category.colorFg }}
                />
              </div>
            </div>
          ))}

          {categoryBreakdown.length === 0 && (
            <p className="mt-4 text-center text-[13.5px] text-[var(--kw-muted)]">
              No categorized business expenses yet. Start categorizing transactions to see insights.
            </p>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-[var(--kw-primary)] p-5 text-white">
          <h3 className="text-[14px] font-semibold">💡 Tip</h3>
          <p className="mt-1 text-[13px] text-white/80">
            Share your bank SMS deposits to automatically track cash revenue. Tap the + button on the home screen to get started.
          </p>
        </div>
      </div>

      <BottomNav dark />
    </div>
  );
}
