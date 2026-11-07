"use client";

import Link from "next/link";

const links = [
  { label: "Home", href: "/dashboard", icon: "home" },
  { label: "Send", href: "/send", icon: "send" },
  { label: "Receive", href: "/receive", icon: "receive" },
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
    case "send":
      return (
        <svg {...props}>
          <path d="m21 3-7.2 18-3.4-7.4L3 10.2 21 3Z" />
          <path d="M10.4 13.6 15 9" />
        </svg>
      );
    case "receive":
      return (
        <svg {...props}>
          <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 17v3h16v-3" />
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
    <header className="sticky top-0 z-30 border-b border-[#eceef1] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 text-[17px] font-bold tracking-tight text-[#111820] sm:text-xl"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#071720] text-white">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
            >
              <path
                d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M8 12h8M12 8v8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          QuiloxLedger
        </Link>
        <DesktopWalletNav active={active} />
        <span className="hidden w-32 text-right text-[11px] text-[#8a929a] lg:block">
          Your secure wallet
        </span>
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
