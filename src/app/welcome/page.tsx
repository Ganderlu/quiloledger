"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    eyebrow: "WELCOME TO QUILOXLEDGER",
    title: "A clearer view of your crypto",
    description:
      "Explore digital assets and wallet tools in one thoughtfully designed place.",
    icon: "bitcoin",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    eyebrow: "YOUR WALLET, YOUR WAY",
    title: "Keep your assets organized",
    description:
      "Bring your balance, activity, and account preferences into a single view.",
    icon: "wallet",
    accent: "from-blue-500 to-cyan-400",
  },
  {
    eyebrow: "MOVE WITH CLARITY",
    title: "Review every step",
    description:
      "Explore sending and exchange tools with clear details before you continue.",
    icon: "arrows",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    eyebrow: "BUILT AROUND YOU",
    title: "A simpler way to get started",
    description:
      "Create an account or sign in to continue to your QuiloxLedger experience.",
    icon: "shield",
    accent: "from-sky-400 to-blue-600",
  },
] as const;

function WelcomeMark({ name }: { name: (typeof slides)[number]["icon"] }) {
  if (name === "bitcoin") {
    return (
      <div className="relative grid h-36 w-44 place-items-center">
        <div className="absolute left-7 top-3 h-28 w-28 rounded-[2rem] border-[12px] border-violet-400/90 bg-gradient-to-br from-violet-500 to-fuchsia-700 shadow-[0_18px_70px_rgba(133,57,255,.35)]">
          <span className="absolute -bottom-2 left-1/2 h-8 w-10 -translate-x-1/2 rounded-b-xl bg-violet-300" />
          <span className="absolute -top-5 left-1/2 h-12 w-14 -translate-x-1/2 rounded-t-[2rem] border-[8px] border-b-0 border-violet-300" />
          <span className="absolute inset-x-0 top-9 text-center text-sm tracking-[.25em] text-fuchsia-200">
            •••
          </span>
        </div>
        <span className="absolute bottom-1 right-0 grid h-[62px] w-[62px] place-items-center rounded-full border-4 border-amber-300 bg-gradient-to-br from-yellow-300 to-amber-500 text-[34px] font-bold text-amber-800 shadow-[0_8px_35px_rgba(245,158,11,.35)]">
          ₿
        </span>
      </div>
    );
  }

  if (name === "wallet") {
    return (
      <div className="relative grid h-36 w-44 place-items-center">
        <div className="absolute h-24 w-36 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-700 shadow-[0_18px_70px_rgba(37,99,235,.35)]" />
        <div className="absolute right-4 top-7 h-12 w-20 rounded-l-xl border border-white/30 bg-white/15 backdrop-blur">
          <span className="absolute left-4 top-5 h-2 w-2 rounded-full bg-white" />
        </div>
        <div className="absolute bottom-3 left-5 h-16 w-16 rounded-2xl border border-cyan-200/70 bg-cyan-300/20" />
        <div className="absolute bottom-0 right-3 grid h-12 w-12 place-items-center rounded-full border border-white/40 bg-cyan-400 text-white shadow-lg">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  }

  if (name === "arrows") {
    return (
      <div className="relative grid h-36 w-44 place-items-center">
        <div className="absolute h-28 w-28 rounded-full border border-emerald-300/25 bg-emerald-300/5 shadow-[0_0_80px_rgba(16,185,129,.16)]" />
        <div className="absolute left-7 top-7 grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white/10 text-emerald-300 backdrop-blur">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h14m0 0-3-3m3 3-3 3M20 17H6m0 0 3-3m-3 3 3 3" />
          </svg>
        </div>
        <div className="absolute bottom-5 right-6 grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-cyan-300 backdrop-blur">
          <span className="text-2xl font-semibold">₿</span>
        </div>
        <span className="absolute right-4 top-3 h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_22px_rgba(110,231,183,.8)]" />
      </div>
    );
  }

  return (
    <div className="relative grid h-36 w-44 place-items-center">
      <div className="absolute h-28 w-28 rounded-full bg-sky-500/20 blur-2xl" />
      <div className="relative grid h-24 w-24 place-items-center rounded-[2rem] border border-sky-300/40 bg-gradient-to-br from-sky-400/25 to-blue-700/40 text-sky-200 shadow-[0_18px_70px_rgba(14,165,233,.22)] backdrop-blur">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <span className="absolute right-3 top-5 h-2 w-2 rounded-full bg-blue-300" />
      <span className="absolute bottom-4 left-4 h-1.5 w-1.5 rounded-full bg-cyan-200" />
    </div>
  );
}

function BrandMark() {
  return (
    <div className="relative grid h-20 w-20 place-items-center text-cyan-400">
      <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-cyan-400" />
      <span className="absolute bottom-1 left-1 h-3 w-3 rounded-full bg-cyan-400" />
      <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-cyan-400" />
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="h-16 w-16"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="square"
      >
        <path d="M43 16a22 22 0 0 0-30 30M21 48a22 22 0 0 0 30-30" />
      </svg>
    </div>
  );
}

export default function WelcomePage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [choosing, setChoosing] = useState(false);

  useEffect(() => {
    if (choosing) return;
    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % slides.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [choosing]);

  const slide = slides[slideIndex];

  return (
    <main className="relative flex min-h-[100svh] flex-1 flex-col overflow-hidden bg-[#05070d] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/night-view.jpg')] bg-cover bg-[center_58%] opacity-65"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,12,.86)_0%,rgba(3,7,18,.7)_38%,rgba(3,7,18,.55)_72%,rgba(3,5,12,.82)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(32,92,180,.16),transparent_50%)]"
      />

      {choosing ? (
        <button
          type="button"
          onClick={() => setChoosing(false)}
          aria-label="Back to introduction"
          className="absolute left-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/20 text-white/75 backdrop-blur transition hover:bg-white/10 hover:text-white sm:left-8 sm:top-8"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6M9 12h12" />
          </svg>
        </button>
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8">
        {!choosing ? (
          <section
            key={slideIndex}
            aria-live="polite"
            className="flex w-full max-w-[650px] flex-col items-center text-center animate-[welcome-in_.5s_ease-out]"
          >
            <WelcomeMark name={slide.icon} />
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[.28em] text-blue-200/75 sm:text-xs">
              {slide.eyebrow}
            </p>
            <h1 className="mt-4 max-w-[600px] text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-[52px]">
              {slide.title}
            </h1>
            <p className="mt-4 max-w-[560px] text-pretty text-sm leading-7 text-slate-200/75 sm:text-base sm:leading-8">
              {slide.description}
            </p>

            <div className="mt-9 flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md">
              {slides.map((item, index) => (
                <button
                  key={item.eyebrow}
                  type="button"
                  aria-label={`Show introduction ${index + 1}`}
                  aria-current={index === slideIndex ? "step" : undefined}
                  onClick={() => setSlideIndex(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === slideIndex
                      ? "w-7 bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,.75)]"
                      : "w-2.5 bg-white/55 hover:bg-white/85"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setChoosing(true)}
              aria-label="Continue to wallet options"
              className={`mt-9 grid h-[88px] w-[88px] place-items-center rounded-full bg-gradient-to-br ${slide.accent} text-white shadow-[0_12px_45px_rgba(37,99,235,.35)] transition hover:scale-105 hover:shadow-[0_15px_55px_rgba(37,99,235,.48)] active:scale-95`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </section>
        ) : (
          <section className="w-full max-w-[720px] animate-[welcome-in_.45s_ease-out]">
            <div className="flex flex-col items-center text-center">
              <BrandMark />
              <p className="mt-8 max-w-[690px] text-pretty text-base leading-8 text-slate-100/90 sm:text-xl sm:leading-9">
                Explore crypto tools, manage your account, and discover digital
                assets, all in one place.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:mt-10">
              <Link
                href="/register"
                className="group flex min-h-[92px] items-center gap-5 rounded-xl border border-blue-300/20 bg-gradient-to-r from-blue-700/95 to-blue-500/95 px-6 text-left shadow-[0_15px_45px_rgba(37,99,235,.2)] transition hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-400 active:scale-[.99] sm:px-9"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-white">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                <span className="text-lg font-semibold tracking-tight sm:text-xl">
                  Create new wallet
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="ml-auto h-5 w-5 opacity-60 transition group-hover:translate-x-1 group-hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>

              <Link
                href="/login"
                className="group flex min-h-[92px] items-center gap-5 rounded-xl border border-blue-300/20 bg-gradient-to-r from-indigo-700/95 to-blue-500/95 px-6 text-left shadow-[0_15px_45px_rgba(37,99,235,.18)] transition hover:-translate-y-0.5 hover:from-indigo-600 hover:to-blue-400 active:scale-[.99] sm:px-9"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-white">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
                  </svg>
                </span>
                <span className="text-lg font-semibold tracking-tight sm:text-xl">
                  Login to your wallet
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="ml-auto h-5 w-5 opacity-60 transition group-hover:translate-x-1 group-hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
            </div>

            <p className="mt-7 text-center text-xs text-slate-300/55">
              By continuing, you agree to use QuiloxLedger responsibly.
            </p>
          </section>
        )}
      </div>

      {!choosing ? (
        <div className="pointer-events-none absolute bottom-5 left-0 right-0 text-center text-[10px] font-medium tracking-wide text-white/35">
          {String(slideIndex + 1).padStart(2, "0")}{" "}
          <span className="mx-1 text-white/20">/</span>{" "}
          {String(slides.length).padStart(2, "0")}
        </div>
      ) : null}
      <style jsx>{`
        @keyframes welcome-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
