"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getWalletNotifications,
  saveWalletNotifications,
  walletNotificationsChangedEvent,
  type WalletNotification,
} from "@/lib/wallet-notifications";

function HeaderIcon({
  name,
  className = "h-[19px] w-[19px]",
}: {
  name: "search" | "flame" | "bell" | "check";
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
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );
    case "flame":
      return (
        <svg {...props}>
          <path d="M12 22c4.5 0 7-3 7-7 0-3.3-2-5.7-4-8-.2 2-1 3-2 3.5C13 6.4 11 3.8 8 2c.6 4-3 6.5-3 12 0 4.5 2.5 8 7 8Z" />
          <path d="M12 22c-2 0-3-1.4-3-3.2 0-1.5 1-2.6 2.4-4 .3 1.2.9 1.7 1.6 2.1 1.4 1.4 1.3 5.1-1 5.1Z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...props}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
  }
}

function notificationDot(tone: WalletNotification["tone"]) {
  if (tone === "success") return "bg-[#27c84a]";
  if (tone === "warning") return "bg-[#f5a623]";
  return "bg-[#075b9d]";
}

const links = [
  { label: "Home", href: "/dashboard", icon: "home" },
  { label: "All Coins", href: "/coins", icon: "coins" },
  { label: "Markets", href: "/markets", icon: "markets" },
  { label: "Swap", href: "/trade", icon: "swap" },
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
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<WalletNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const syncNotifications = () => setNotifications(getWalletNotifications());
    syncNotifications();
    window.addEventListener(walletNotificationsChangedEvent, syncNotifications);
    window.addEventListener("storage", syncNotifications);
    return () => {
      window.removeEventListener(
        walletNotificationsChangedEvent,
        syncNotifications,
      );
      window.removeEventListener("storage", syncNotifications);
    };
  }, []);

  function markAllRead() {
    const updated = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(updated);
    saveWalletNotifications(updated);
  }

  function markNotificationRead(id: string) {
    const updated = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    );
    setNotifications(updated);
    saveWalletNotifications(updated);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#eceef1] bg-white/95 backdrop-blur dark:border-[#293238] dark:bg-[#171e23]/95">
      <div className="mx-auto flex h-[60px] max-w-[1440px] items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-10">
        <Link
          href="/profile"
          aria-label="Your profile"
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#e8f4ed] to-[#d6ecdd] text-sm font-bold text-[#239451] ring-1 ring-[#27c84a]/30 transition active:scale-95 sm:h-10 sm:w-10"
        >
          {(user?.displayName || user?.email || "Q").slice(0, 1).toUpperCase()}
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#27c84a] dark:border-[#171e23]" />
        </Link>

        <Link
          href="/coins"
          aria-label="Search assets and markets"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[#0c2932] px-3.5 py-2.5 transition hover:bg-[#123a45] active:scale-[0.99] dark:bg-[#232b31] dark:hover:bg-[#2a343b] sm:px-4"
        >
          <HeaderIcon
            name="search"
            className="h-[18px] w-[18px] shrink-0 text-white/70"
          />
          <HeaderIcon
            name="flame"
            className="h-[18px] w-[18px] shrink-0 text-[#ff8a3d]"
          />
          <span className="truncate text-sm font-medium text-white/60">
            Search assets, markets…
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <div className="relative">
            <button
              type="button"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative grid h-9 w-9 place-items-center rounded-full text-[#555c64] transition hover:bg-[#f3f5f7] active:scale-95 dark:text-[#aeb6bd] dark:hover:bg-white/5 sm:h-10 sm:w-10"
            >
              <HeaderIcon name="bell" />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#e74c3c] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-[#171e23]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </button>
            {notificationsOpen ? (
              <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-[#e8eaee] bg-white shadow-2xl dark:border-[#293238] dark:bg-[#171e23]">
                <div className="flex items-center justify-between border-b border-[#f0f1f3] px-4 py-3 dark:border-[#293238]">
                  <p className="text-sm font-bold text-[#25282d] dark:text-white">
                    Notifications
                  </p>
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#075b9d] transition hover:underline"
                    >
                      <HeaderIcon name="check" className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  ) : null}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <p className="text-sm font-semibold text-[#555c64] dark:text-[#d6dbe0]">
                      You’re all caught up
                    </p>
                    <p className="mt-1 text-xs text-[#9298a0] dark:text-[#7a828a]">
                      New notifications will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => markNotificationRead(notification.id)}
                        className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-[#f7f8fa] dark:hover:bg-white/5 ${
                          !notification.read
                            ? "bg-[#f5faff] dark:bg-[#0c1a24]"
                            : ""
                        }`}
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            notification.read
                              ? "bg-transparent"
                              : notificationDot(notification.tone)
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[13px] font-semibold text-[#25282d] dark:text-white">
                              {notification.title}
                            </span>
                            <span className="shrink-0 text-[10px] text-[#9298a0] dark:text-[#7a828a]">
                              {notification.time}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs leading-4 text-[#6b7280] dark:text-[#aeb6bd]">
                            {notification.message}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden border-t border-[#f0f1f3] bg-[#fafbfc] md:block dark:border-[#293238] dark:bg-[#141b20]">
        <div className="mx-auto flex max-w-[1440px] items-center px-4 sm:px-6 lg:px-10">
          <DesktopWalletNav active={active} />
        </div>
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
