import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden" style={{ background: "var(--kw-primary)" }}>
      <div className="px-6 pt-2">
        <div className="flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-display)] text-[22px] font-bold text-white">
            Profile
          </h1>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f6cf9a] text-3xl">
            🙂
          </div>
          <div>
            <p className="text-[19px] font-bold text-white">Amikhy</p>
            <p className="text-[13.5px] text-white/60">mike@mikhy.me</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto rounded-t-[28px] bg-[var(--kw-bg)] px-5 pb-28 pt-6">
        <div className="mt-10 rounded-2xl bg-white p-5">
          <h3 className="text-[15px] font-semibold text-[var(--kw-ink)]">App Info</h3>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-[13px] text-[var(--kw-muted)]">Version</span>
              <span className="text-[13px] font-medium text-[var(--kw-ink)]">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[13px] text-[var(--kw-muted)]">Member since</span>
              <span className="text-[13px] font-medium text-[var(--kw-ink)]">20 July 2026</span>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
