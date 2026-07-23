import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, Briefcase, Home } from "lucide-react";
import { categories, formatMWK } from "@/lib/data";
import { getTransactionById, updateTransactionApi } from "@/lib/db";
import type { Transaction } from "@/lib/types";
import BottomNav from "@/components/BottomNav";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getTransactionById(id)
      .then((result) => setTxn(result || null))
      .catch(() => setTxn(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleTagChange = async (tag: "business" | "personal") => {
    if (!txn || !id) return;
    try {
      const updated = await updateTransactionApi(id, { tag });
      setTxn(updated);
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="relative flex h-full flex-col" style={{ background: "var(--kw-primary)" }}>
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        </div>
      </div>
    );
  }

  if (!txn) return <Navigate to="/transactions" replace />;

  const category =
    categories.find((c) => c.key === txn.category) ??
    categories.find((c) => c.key === "uncategorized")!;

  return (
    <div className="relative flex h-full flex-col" style={{ background: "var(--kw-primary)" }}>
      <div className="px-5 pt-2">
        <div className="grid grid-cols-[36px_1fr_36px] items-center">
          <Link
            to="/transactions"
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
          >
            <ChevronLeft size={18} color="#fff" />
          </Link>
          <h1 className="text-center text-[16px] font-semibold text-white">Transaction Details</h1>
          <span />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4">
        <div className="mt-6 flex flex-col items-center text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-[18px] font-semibold"
            style={{ background: txn.avatarBg, color: txn.avatarFg }}
          >
            {txn.initial}
          </div>
          <p className="mt-3 text-[16px] font-semibold text-white">
            {txn.name}
          </p>

          <button
            className="mt-3 flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ background: category.colorBg }}
          >
            <span>{category.emoji}</span>
            <span className="text-[13.5px] font-medium" style={{ color: category.colorFg }}>
              {category.label}
            </span>
            <ChevronDown size={14} color={category.colorFg} />
          </button>
        </div>

        <div className="mb-2 mt-6 flex items-center justify-center gap-4 rounded-2xl bg-white/10 p-4">
          <p className="text-[13px] text-white/70">Tag as:</p>
          <button
            onClick={() => handleTagChange("business")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
              txn.tag === "business"
                ? "bg-white text-[var(--kw-primary)]"
                : "bg-white/15 text-white"
            }`}
          >
            <Briefcase size={14} />
            <span>Business</span>
          </button>
          <button
            onClick={() => handleTagChange("personal")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
              txn.tag === "personal"
                ? "bg-white text-[var(--kw-primary)]"
                : "bg-white/15 text-white"
            }`}
          >
            <Home size={14} />
            <span>Personal</span>
          </button>
        </div>

        <div className="mt-2 space-y-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <Row label="Type" value={txn.direction === "credit" ? "Credit" : "Debit"} valueColor="var(--kw-success)" />
            <Row label="Description" value={txn.description ?? txn.name} />
            {txn.rawSms && (
              <Row label="Original SMS" value={txn.rawSms.slice(0, 60) + (txn.rawSms.length > 60 ? "..." : "")} />
            )}
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <Row
              label="Amount"
              value={`${txn.direction === "credit" ? "+" : "-"}${formatMWK(txn.amount)}`}
              valueColor={txn.direction === "credit" ? "var(--kw-success)" : "white"}
              bold
            />
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <Row
              label="Date"
              value={new Date(txn.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
            <Row
              label="Time"
              value={new Date(txn.date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </div>
        </div>
      </div>
      <BottomNav dark />
    </div>
  );
}

function Row({
  label,
  value,
  valueColor,
  bold,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13.5px] text-white/60">{label}</span>
      <span
        className={`text-[14.5px] ${bold ? "font-semibold" : "font-medium"}`}
        style={{ color: valueColor ?? "white" }}
      >
        {value}
      </span>
    </div>
  );
}
