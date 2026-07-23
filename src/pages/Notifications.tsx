import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const initial = [
  { key: "transaction", label: "Transaction alert", on: true },
  { key: "insight", label: "Insight alert", on: false },
  { key: "sort", label: "Sort Transactions alert", on: false },
];

export default function NotificationSettingsPage() {
  const [items, setItems] = useState(initial);

  const toggle = (key: string) =>
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, on: !i.on } : i))
    );

  return (
    <div className="relative flex h-full flex-col" style={{ background: "var(--kw-primary)" }}>
      <div className="px-5 pt-2 pb-24">
        <div className="grid grid-cols-[36px_1fr_36px] items-center">
          <Link
            to="/profile"
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
          >
            <ChevronLeft size={18} color="#fff" />
          </Link>
          <h1 className="text-center text-[16px] font-semibold text-white">
            Notifications
          </h1>
          <span />
        </div>

        <div className="mt-6 divide-y divide-white/10">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-4">
              <span className="text-[14.5px] text-white">{item.label}</span>
              <button
                role="switch"
                aria-checked={item.on}
                aria-label={item.label}
                onClick={() => toggle(item.key)}
                className="relative h-6 w-11 rounded-full transition-colors"
                style={{ background: item.on ? "var(--kw-primary)" : "rgba(255,255,255,0.15)" }}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: item.on ? "translateX(22px)" : "translateX(2px)" }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      <BottomNav dark />
    </div>
  );
}
