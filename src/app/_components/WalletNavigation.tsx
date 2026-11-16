"use client";

import Link from "next/link";

const links = [
  { label: "Home", href: "/dashboard", icon: "home" },
  { label: "All Coins", href: "/coins", icon: "coins" },
  { label: "Markets", href: "/markets", icon: "markets" },
  { label: "Swap", href: "/swap", icon: "swap" },
  { label: "Card", href: "/card", icon: "card" },
] as const;

function NavIcon({ name }: { name: string }) {
  const props = {
    "aria-hidden": true as const,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-[17px] w-[17px]",
  };

  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V10Z" />
        </svg>
      );
    case "coins":
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="5" />
          <circle cx="16" cy="16" r="5" />
          <path d="M8 5.5v5m1.5-3.5h-3M16 13.5v5m1.5-3.5h-3" />
        </svg>
      );
    case "markets":
      return (
        <svg {...props}>
          <path d="M4 19V10m6 9V5m6 14v-7m6 7V8M3 20h18" />
        </svg>
      );
    case "swap":
      return (
        <svg {...props}>
          <path d="M4 7h14m0 0-3-3m3 3-3 3M20 17H6m0 0 3-3m-3 3 3 3" />
        </svg>
      );
    case "card":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18m-14 5h4" />
        </svg>
      );
    default:
      return null;
  }
}

export function DesktopWalletNav({ active }: { active: string }) {
  return (
    <nav
      aria-label="Wallet pages"
      className="hidden items-center gap-1 md:flex"
    >
      {links.map((item) => {
        const selected = active === item.label;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={selected ? "page" : undefined}
            className={`rounded-full px-3 py-2 text-[13px] font-semibold transition ${
              selected
                ? "bg-[#e9f3fb] text-[#075b9d]"
                : "text-[#626a73] hover:bg-[#f3f5f7] hover:text-[#202830]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function WalletPageHeader({ active }: { active: string }) {
  return (
    <header className="sticky top-0 z-30 hidden bg-white/95 backdrop-blur md:block md:border-b md:border-[#eceef1]">
      <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-center gap-4 px-4 sm:px-6 lg:px-10">
        <DesktopWalletNav active={active} />
      </div>
    </header>
  );
}

export function MobileWalletNav({ active }: { active: string }) {
  return (
    <nav
      aria-label="Wallet navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e7e9ec] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(20,30,40,0.06)] backdrop-blur sm:hidden"
    >
      <div className="mx-auto grid h-[59px] max-w-lg grid-cols-5">
        {[links[1], links[2], links[0], links[3], links[4]].map((item) => {
          const selected = active === item.label;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={selected ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 text-[9px] font-medium transition active:scale-95 ${
                selected ? "text-[#075b9d]" : "text-[#666c72]"
              }`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full ${
                  selected ? "bg-[#e6f2fc] text-[#075b9d]" : ""
                }`}
              >
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
