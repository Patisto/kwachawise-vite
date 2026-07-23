import { Link } from "react-router-dom";
import type { Transaction } from "@/lib/types";
import { formatMWK } from "@/lib/data";

export default function TransactionRow({ txn }: { txn: Transaction }) {
  const timeStr = new Date(txn.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Link
      to={`/transactions/${txn.id}`}
      className="flex items-center gap-3 py-3"
      style={{ opacity: txn.faded ? 0.35 : 1 }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold"
        style={{ background: txn.avatarBg, color: txn.avatarFg }}
      >
        {txn.initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-medium text-[var(--kw-ink)]">
          {txn.name}
        </p>
        <p className="text-[12.5px] text-[var(--kw-muted)]">
          {timeStr}
        </p>
      </div>
      <span
        className="shrink-0 text-[14.5px] font-semibold"
        style={{
          color: txn.direction === "credit" ? "var(--kw-success)" : "var(--kw-ink)",
        }}
      >
        {txn.direction === "credit" ? "+" : "-"}
        {formatMWK(txn.amount)}
      </span>
    </Link>
  );
}
