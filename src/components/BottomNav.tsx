import { Link, useLocation } from "react-router-dom";
import { Home, PieChart, BarChart2, User } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/budget", label: "Budget", icon: PieChart },
  { href: "/insights", label: "Insights", icon: BarChart2 },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav({ dark = false }: { dark?: boolean }) {
  const { pathname } = useLocation();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around pt-3 pb-2"
      style={{
        background: dark ? "transparent" : "var(--kw-surface)",
      }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        const color = dark
          ? active
            ? "#ffffff"
            : "rgba(255,255,255,0.55)"
          : active
            ? "var(--kw-primary)"
            : "var(--kw-muted-soft)";
        return (
          <Link
            key={href}
            to={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className="flex h-11 w-11 items-center justify-center rounded-2xl transition-colors"
            style={{
              background: active && dark ? "rgba(255,255,255,0.14)" : "transparent",
            }}
          >
            <Icon size={22} color={color} strokeWidth={2.2} />
          </Link>
        );
      })}
      <div className="absolute -bottom-0 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-black/20" />
    </div>
  );
}
