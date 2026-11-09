"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

export function MobileMenu({ onImage = false }: { onImage?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors lg:hidden ${
          onImage
            ? "border-white/30 text-white hover:bg-white/10"
            : "border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-white/10"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
        >
          <path
            d="M4 7H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M4 12H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M4 17H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open
        ? createPortal(
            <div
              id={panelId}
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[1000] lg:hidden"
            >
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/25 backdrop-blur-sm"
              />

              <div className="absolute inset-0 bg-white dark:bg-zinc-950" />
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15" />
                <div className="absolute -bottom-48 -right-48 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />
              </div>

              <div className="relative flex h-full flex-col">
                <div className="border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/70">
                  <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
                    <Link
                      href="/"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2"
                    >
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
                      <span className="text-base font-semibold tracking-tight text-blue-700 dark:text-white">
                        QuiloxLedger
                      </span>
                    </Link>

                    <button
                      type="button"
                      aria-label="Close menu"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-white/10"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 overflow-auto px-4 py-8">
                  <nav className="grid gap-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5"
                    >
                      Wallet
                      <span className="text-zinc-400">→</span>
                    </Link>
                    <a
                      href="#features"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5"
                    >
                      Features
                      <span className="text-zinc-400">→</span>
                    </a>
                    <Link
                      href="/help"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5"
                    >
                      Help Center
                      <span className="text-zinc-400">→</span>
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5"
                    >
                      Contact Us
                      <span className="text-zinc-400">→</span>
                    </Link>
                    <a
                      href="#about"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5"
                    >
                      About
                      <span className="text-zinc-400">→</span>
                    </a>
                  </nav>

                  <div className="grid gap-3">
                    <Link
                      href="/welcome"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 dark:border-zinc-800 dark:text-white dark:hover:bg-white/10"
                    >
                      Login
                    </Link>
                    <Link
                      href="/welcome"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-blue-700 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
