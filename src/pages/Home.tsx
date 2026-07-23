import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, SlidersHorizontal, Share2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { formatMWK } from "@/lib/data";
import { getProcessedTransactions, getUnprocessedTransactions } from "@/lib/db";
import type { Transaction } from "@/lib/types";

export default function HomePage() {
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

  const businessTxns = processed.filter((t) => t.tag === "business");
  const personalTxns = processed.filter((t) => t.tag === "personal");
  const unprocessedCount = unprocessed.length;
  const hasNotification = unprocessedCount > 5;

  const businessIncome = businessTxns
    .filter((t) => t.direction === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const businessExpenses = businessTxns
    .filter((t) => t.direction === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = businessIncome - businessExpenses;

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
      <div className="kw-scroll flex-1 overflow-y-auto px-5 pb-28 pt-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[22px] font-bold text-white">
              Hello Amikhy
            </h1>
            <p className="mt-0.5 text-sm text-white/70">
              Your business finances are looking good
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/profile/notifications"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15"
            >
              <Bell size={18} color="#fff" />
              {hasNotification && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--kw-danger)] text-[9px] font-bold text-white">
                  !
                </span>
              )}
            </Link>
          </div>
        </div>

        <div
          className="relative mt-5 overflow-hidden rounded-[28px] p-6"
          style={{
            background:
              "radial-gradient(120% 140% at 100% 0%, #4a3ff5 0%, #372ee0 45%, #241c7f 100%)",
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            width="100%"
            height="100%"
          >
            <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.4" fill="#fff" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          <div className="relative flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-2xl">
              💼
            </div>
            <p className="mt-4 text-[13px] text-white/70">Your business profit this month</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-[34px] font-extrabold text-white">
              {formatMWK(profit)}
            </p>
            <p className="mt-2 text-[12.5px] text-white/65">
              Income: {formatMWK(businessIncome)} • Expenses: {formatMWK(businessExpenses)}
            </p>
          </div>

          <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="text-center">
              <p className="text-[11px] text-white/60">Business</p>
              <p className="text-[13px] font-bold text-white">{businessTxns.length} txns</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-[11px] text-white/60">Personal</p>
              <p className="text-[13px] font-bold text-white">{personalTxns.length} txns</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-[11px] text-white/60">To sort</p>
              <p className="text-[13px] font-bold text-white">{unprocessedCount}</p>
            </div>
          </div>
        </div>

        {hasNotification && (
          <Link
            to="/sort"
            className="mt-4 flex items-center justify-between rounded-[22px] bg-[var(--kw-danger)] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                !
              </div>
              <div>
                <p className="text-[14px] font-bold text-white">You have {unprocessedCount} messages to sort</p>
                <p className="text-[12px] text-white/80">
                  Sort them to update your business ledger
                </p>
              </div>
            </div>
          </Link>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            to="/share-target"
            className="relative flex items-center gap-3 rounded-[22px] p-4"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <Share2 size={20} color="#fff" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">Add SMS</p>
              <p className="text-[12px] text-white/60">
                Share or paste
              </p>
            </div>
          </Link>

          <Link
            to="/sort"
            className="relative flex items-center gap-3 rounded-[22px] p-4"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <SlidersHorizontal size={20} color="#fff" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">Sort</p>
              <p className="text-[12px] text-white/60">
                {unprocessedCount} pending
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-[13px] font-medium text-white/60">Recent Business Transactions</p>
          <Link to="/transactions" className="text-[13px] font-medium text-white/80">
            View all
          </Link>
        </div>

        <div className="mt-2 space-y-3">
          {businessTxns.slice(0, 3).map((txn) => (
            <Link
              key={txn.id}
              to={`/transactions/${txn.id}`}
              className="flex items-center justify-between rounded-2xl bg-white/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold"
                  style={{ background: txn.avatarBg, color: txn.avatarFg }}
                >
                  {txn.initial}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">{txn.name}</p>
                  <p className="text-[12px] text-white/60">
                    {new Date(txn.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
              <span
                className="text-[14px] font-semibold"
                style={{ color: txn.direction === "credit" ? "#4ade80" : "#fff" }}
              >
                {txn.direction === "credit" ? "+" : "-"}
                {formatMWK(txn.amount)}
              </span>
            </Link>
          ))}

          {businessTxns.length === 0 && (
            <p className="text-center text-[13px] text-white/60 mt-4">
              No business transactions yet. Share an SMS to get started!
            </p>
          )}
        </div>
      </div>

      <BottomNav dark />
    </div>
  );
}
