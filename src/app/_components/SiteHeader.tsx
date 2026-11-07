"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;

    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  if (
    pathname === "/dashboard" ||
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
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4">
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

        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium md:flex">
          <a href="#markets" className={navLink}>
            Markets
          </a>
          <Link href="#wallet" className={navLink}>
            Wallet
          </Link>
          <a href="#features" className={navLink}>
            Features
          </a>
          <a href="#build" className={navLink}>
            Build
          </a>
          <a href="#support" className={navLink}>
            Support
          </a>
          <a href="#about" className={navLink}>
            About
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle onImage={overImage} />
          <button
            type="button"
            className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
              overImage
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-blue-500 text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-white/10"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M12 2C7 2 3 6 3 11C3 16 7 20 12 20C17 20 21 16 21 11C21 6 17 2 12 2Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M3 11H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 2C14.5 4.6 16 7.7 16 11C16 14.3 14.5 17.4 12 20C9.5 17.4 8 14.3 8 11C8 7.7 9.5 4.6 12 2Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span className="hidden sm:inline">Language</span>
          </button>
          <Link
            href="/login"
            className={`hidden h-10 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors sm:inline-flex ${outlineAction}`}
          >
            Login
          </Link>
          <Link
            href="/register"
            className={`hidden h-10 items-center justify-center rounded-full px-5 text-sm font-semibold shadow-sm transition-colors sm:inline-flex ${
              overImage
                ? "bg-white text-blue-800 hover:bg-white/90"
                : "bg-blue-700 text-white hover:bg-blue-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            }`}
          >
            Register
          </Link>
          <MobileMenu onImage={overImage} />
        </div>
      </div>
    </header>
  );
}
