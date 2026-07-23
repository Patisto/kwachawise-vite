"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { formatMWK } from "@/lib/data";

interface CategorizeItem {
  id: string;
  name: string;
  amount: number;
  date: string;
  remark: string;
}

export default function SwipeCard({
  item,
  onSwipe,
  isTop,
}: {
  item: CategorizeItem;
  onSwipe: (dir: "left" | "right") => void;
  isTop: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-14, 14]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);

  return (
    <motion.div
      className="absolute inset-x-0 top-0 rounded-[22px] border border-[var(--kw-line)] bg-white p-5 shadow-lg"
      style={{ x, rotate, touchAction: "pan-y" }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={(_, info) => {
        if (info.offset.x > 110) onSwipe("right");
        else if (info.offset.x < -110) onSwipe("left");
      }}
      animate={isTop ? { scale: 1, y: 0 } : { scale: 0.96, y: 10 }}
      exit={{ x: x.get() > 0 ? 400 : -400, opacity: 0, transition: { duration: 0.25 } }}
    >
      <motion.span
        className="absolute left-4 top-4 rounded-lg border-2 border-[var(--kw-danger)] px-2 py-0.5 text-[11px] font-bold text-[var(--kw-danger)]"
        style={{ opacity: nopeOpacity }}
      >
        SKIP
      </motion.span>
      <motion.span
        className="absolute right-4 top-4 rounded-lg border-2 border-[var(--kw-success)] px-2 py-0.5 text-[11px] font-bold text-[var(--kw-success)]"
        style={{ opacity: likeOpacity }}
      >
        GOT IT
      </motion.span>

      <p className="text-[11px] text-[var(--kw-muted)]">Transaction Details</p>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <p className="text-[13.5px] font-semibold text-[var(--kw-ink)]">
            {item.name}
          </p>
          <p className="text-[11px] text-[var(--kw-muted)]">{item.date}</p>
        </div>
        <div className="text-right">
          <p className="text-[16px] font-bold text-[var(--kw-danger)]">
            {formatMWK(item.amount)}.00
          </p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[var(--kw-muted)]">Transaction Remark</p>
      <p className="mt-1 text-[13px] font-medium leading-snug text-[var(--kw-ink)]">
        {item.remark}
      </p>
    </motion.div>
  );
}
