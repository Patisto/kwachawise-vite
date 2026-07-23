"use client";

import { X, Calendar } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FilterSheet({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full rounded-t-[28px] bg-white px-5 pb-8 pt-3">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[var(--kw-line)]" />

        <div className="flex items-center justify-between">
          <button onClick={onClose} aria-label="Close filters">
            <X size={20} color="var(--kw-ink)" />
          </button>
          <h2 className="text-[16px] font-semibold text-[var(--kw-ink)]">Filters</h2>
          <span />
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-[var(--kw-bg)] px-4 py-3.5">
          <div>
            <p className="text-[11.5px] text-[var(--kw-muted)]">Date</p>
            <p className="mt-0.5 text-[14px] font-medium text-[var(--kw-ink)]">
              01 Sep 2025 - 10 Sep 2026
            </p>
          </div>
          <Calendar size={20} color="var(--kw-primary)" />
        </div>

        <button
          onClick={onClose}
          className="mt-7 w-full rounded-full bg-[var(--kw-primary)] py-3.5 text-[15px] font-bold text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
