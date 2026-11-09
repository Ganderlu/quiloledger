"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

type HeaderIconName =
  | "home"
  | "wallet"
  | "features"
  | "explorer"
  | "about"
  | "support"
  | "globe"
  | "signup"
  | "login"
  | "chevron"
  | "send"
  | "receive"
  | "swap"
  | "card"
  | "shield"
  | "book";

function HeaderIcon({
  name,
  className = "h-[17px] w-[17px]",
}: {
  name: HeaderIconName;
  className?: string;
}) {
  const props = {
    "aria-hidden": true as const,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V10Z" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="15" rx="2" />
          <path d="M3 9h18m-5 5h.01" />
        </svg>
      );
    case "features":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="7" height="7" rx="1.5" />
          <rect x="14" y="4" width="7" height="7" rx="1.5" />
          <rect x="3" y="15" width="7" height="6" rx="1.5" />
          <rect x="14" y="15" width="7" height="6" rx="1.5" />
        </svg>
      );
    case "explorer":
      return (
        <svg {...props}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21" />
        </svg>
      );
    case "about":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="M6 16c.7-1.6 1.7-2.4 3-2.4s2.3.8 3 2.4m2-5h4m-4 4h4" />
        </svg>
      );
    case "support":
      return (
        <svg {...props}>
          <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
          <path d="M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2Zm16 0h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2ZM12 20h3" />
        </svg>
      );
    case "globe":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "signup":
      return (
        <svg {...props}>
          <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
          <path d="m10 16 4-4-4-4m4 4H3" />
          <path d="M7 4h3" />
        </svg>
      );
    case "login":
      return (
        <svg {...props}>
          <path d="M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...props} className={`${className} transition-transform`}>
          <path d="m7 10 5 5 5-5" />
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
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5v-12Z" />
          <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8m-8 4h7" />
        </svg>
      );
  }
}

const dropdowns = {
  Wallet: [
    {
      label: "Wallet overview",
      description: "View your account and balances",
      href: "/dashboard",
      icon: "wallet" as const,
    },
    {
      label: "Send funds",
      description: "Transfer from your wallet",
      href: "/send",
      icon: "send" as const,
    },
    {
      label: "Receive funds",
      description: "Get your receiving details",
      href: "/receive",
      icon: "receive" as const,
    },
    {
      label: "Swap assets",
      description: "Preview an asset exchange",
      href: "/swap",
      icon: "swap" as const,
    },
    {
      label: "Your card",
      description: "Manage card preferences",
      href: "/card",
      icon: "card" as const,
    },
  ],
  Features: [
    {
      label: "Explore features",
      description: "See what QuiloxLedger offers",
      href: "#features",
      icon: "features" as const,
    },
    {
      label: "Security",
      description: "Account and wallet protection",
      href: "#about",
      icon: "shield" as const,
    },
    {
      label: "Product overview",
      description: "Learn about QuiloxLedger",
      href: "#about",
      icon: "explorer" as const,
    },
  ],
  Support: [
    {
      label: "Help center",
      description: "Guides and product information",
      href: "/help",
      icon: "book" as const,
    },
    {
      label: "Account support",
      description: "Sign in to manage your account",
      href: "/welcome",
      icon: "support" as const,
    },
    {
      label: "Contact us",
      description: "Send a message to our team",
      href: "/contact",
      icon: "login" as const,
    },
  ],
} as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<
    keyof typeof dropdowns | null
  >(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenDropdown(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  if (
    pathname === "/dashboard" ||
    pathname === "/coins" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/welcome" ||
    pathname === "/card" ||
    pathname === "/swap" ||
    pathname === "/settings" ||
    pathname === "/send" ||
    pathname === "/receive"
  ) {
    return null;
  }

  const overImage = isHome && !scrolled;

  const navLink = overImage
    ? "text-white/80 transition-colors hover:text-white"
    : "text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white";

  const outlineAction = overImage
    ? "border-white/30 text-white hover:bg-white/10"
    : "border-zinc-200 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-white/10";

  return (
    <header
      className={`z-50 border-b transition-colors duration-300 ${
        overImage
          ? "absolute top-0 left-0 right-0 border-transparent bg-transparent"
          : "sticky top-0 border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/60"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 via-blue-600 to-indigo-600 text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M12 2L20 6V12C20 17 16.4 20.8 12 22C7.6 20.8 4 17 4 12V6L12 2Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span
            className={`text-lg font-semibold tracking-tight transition-colors ${
              overImage ? "text-white" : "text-blue-700 dark:text-white"
            }`}
          >
            QuiloxLedger
          </span>
        </Link>

        <nav
          ref={navRef}
          aria-label="Main navigation"
          className="hidden flex-1 items-center justify-center gap-1 text-sm font-medium xl:flex"
        >
          {(["Wallet", "Features"] as const).map((label) => {
            const expanded = openDropdown === label;
            return (
              <div key={label} className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={expanded}
                  onClick={() => setOpenDropdown(expanded ? null : label)}
                  className={`group inline-flex h-10 items-center gap-2 rounded-full px-3 transition-colors hover:bg-white/10 ${
                    navLink
                  }`}
                >
                  <HeaderIcon
                    name={label.toLowerCase() as "wallet" | "features"}
                  />
                  <span>{label}</span>
                  <HeaderIcon
                    name="chevron"
                    className={`h-3.5 w-3.5 ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                {expanded ? (
                  <div
                    role="menu"
                    className="absolute left-0 top-[calc(100%+10px)] z-[70] w-[300px] overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-2 text-zinc-800 shadow-[0_20px_55px_rgba(15,23,42,0.18)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    {dropdowns[label].map((item) => (
                      <Link
                        key={item.label}
                        role="menuitem"
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none dark:hover:bg-white/10 dark:focus:bg-white/10"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                          <HeaderIcon name={item.icon} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-semibold">
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          <a
            href="#about"
            className={`inline-flex h-10 items-center gap-2 rounded-full px-3 transition-colors hover:bg-white/10 ${navLink}`}
          >
            <HeaderIcon name="about" />
            <span>About Us</span>
          </a>

          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={openDropdown === "Support"}
              onClick={() =>
                setOpenDropdown(openDropdown === "Support" ? null : "Support")
              }
              className={`inline-flex h-10 items-center gap-2 rounded-full px-3 transition-colors hover:bg-white/10 ${navLink}`}
            >
              <HeaderIcon name="support" />
              <span>Support</span>
              <HeaderIcon
                name="chevron"
                className={`h-3.5 w-3.5 ${openDropdown === "Support" ? "rotate-180" : ""}`}
              />
            </button>
            {openDropdown === "Support" ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+10px)] z-[70] w-[290px] overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-2 text-zinc-800 shadow-[0_20px_55px_rgba(15,23,42,0.18)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                {dropdowns.Support.map((item) => (
                  <Link
                    key={item.label}
                    role="menuitem"
                    href={item.href}
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none dark:hover:bg-white/10 dark:focus:bg-white/10"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      <HeaderIcon name={item.icon} />
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle onImage={overImage} />
          <button
            type="button"
            className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
              overImage
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-blue-500 text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-white/10"
            }`}
          >
            <HeaderIcon name="globe" className="h-4 w-4" />
            <span className="hidden sm:inline">Language</span>
          </button>
          <Link
            href="/welcome"
            className={`hidden h-10 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors sm:inline-flex ${outlineAction}`}
          >
            <HeaderIcon name="login" className="h-4 w-4" />
            <span>Log In</span>
          </Link>
          <Link
            href="/welcome"
            className={`hidden h-10 items-center justify-center rounded-full px-5 text-sm font-semibold shadow-sm transition-colors sm:inline-flex ${
              overImage
                ? "bg-white text-blue-800 hover:bg-white/90"
                : "bg-blue-700 text-white hover:bg-blue-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            }`}
          >
            <HeaderIcon name="signup" className="h-4 w-4" />
            <span>Sign Up</span>
          </Link>
          <MobileMenu onImage={overImage} />
        </div>
      </div>
    </header>
  );
}
