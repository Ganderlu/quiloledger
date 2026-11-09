"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type HelpIconName =
  | "rocket"
  | "shield"
  | "send"
  | "swap"
  | "card"
  | "receipt"
  | "search"
  | "chevron"
  | "book"
  | "chat"
  | "lock";

function HelpIcon({
  name,
  className = "h-5 w-5",
}: {
  name: HelpIconName;
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
    case "rocket":
      return (
        <svg {...props}>
          <path d="M5 15c-1.5 1.5-2 4-2 6 2 0 4.5-.5 6-2" />
          <path d="M9 19c-2 0-4-2-4-4 0-5 3-9 7-11 3-1.6 6-2 9-2 0 3-.4 6-2 9-2 4-6 7-11 7Z" />
          <circle cx="14.5" cy="9.5" r="1.6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 3 19 6v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "send":
      return (
        <svg {...props}>
          <path d="M21 3 3 10l7 2.5L13 21l8-18Z" />
          <path d="M10 12.5 21 3" />
        </svg>
      );
    case "swap":
      return (
        <svg {...props}>
          <path d="M4 8h13m0 0-3-3m3 3-3 3M20 16H7m0 0 3-3m-3 3 3 3" />
        </svg>
      );
    case "card":
      return (
        <svg {...props}>
          <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
          <path d="M3 10h18M6.5 14.5h3" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...props}>
          <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
          <path d="M9.5 8h5M9.5 12h5" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...props}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5v-12Z" />
          <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
        </svg>
      );
    case "chat":
      return (
        <svg {...props}>
          <path d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    default:
      return null;
  }
}

const categories = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Set up your wallet and learn the basics.",
    icon: "rocket" as const,
  },
  {
    id: "security",
    title: "Account & security",
    description: "Protect your account and manage sign-in.",
    icon: "shield" as const,
  },
  {
    id: "transfers",
    title: "Send & receive",
    description: "Move funds into and out of your wallet.",
    icon: "send" as const,
  },
  {
    id: "swap",
    title: "Swap & convert",
    description: "Understand exchange previews and rates.",
    icon: "swap" as const,
  },
  {
    id: "cards",
    title: "Cards",
    description: "Manage your QuiloxLedger card.",
    icon: "card" as const,
  },
  {
    id: "fees",
    title: "Fees & limits",
    description: "Review costs and account limits.",
    icon: "receipt" as const,
  },
] as const;

type CategoryId = (typeof categories)[number]["id"];

type Article = {
  title: string;
  category: CategoryId;
  categoryLabel: string;
  excerpt: string;
  readTime: string;
};

const articles: Article[] = [
  {
    title: "Create your QuiloxLedger wallet",
    category: "getting-started",
    categoryLabel: "Getting started",
    excerpt:
      "Register with your email, choose a country and currency, and confirm your password.",
    readTime: "3 min read",
  },
  {
    title: "Set your preferred currency",
    category: "getting-started",
    categoryLabel: "Getting started",
    excerpt:
      "Display balances and sample values in your local currency from Settings.",
    readTime: "2 min read",
  },
  {
    title: "Explore the wallet dashboard",
    category: "getting-started",
    categoryLabel: "Getting started",
    excerpt:
      "Find your balance card, quick actions, and the full asset list in one place.",
    readTime: "3 min read",
  },
  {
    title: "Keep your account secure",
    category: "security",
    categoryLabel: "Account & security",
    excerpt:
      "Use a strong password, keep it private, and review account activity regularly.",
    readTime: "4 min read",
  },
  {
    title: "Change your password",
    category: "security",
    categoryLabel: "Account & security",
    excerpt:
      "Update your password from Settings after confirming your current one.",
    readTime: "2 min read",
  },
  {
    title: "Reset a forgotten password",
    category: "security",
    categoryLabel: "Account & security",
    excerpt:
      "Use Password Recovery on the sign-in screen to receive a reset link by email.",
    readTime: "2 min read",
  },
  {
    title: "Send funds from your wallet",
    category: "transfers",
    categoryLabel: "Send & receive",
    excerpt:
      "Enter a destination address and amount, then confirm the details before sending.",
    readTime: "3 min read",
  },
  {
    title: "Find your receiving details",
    category: "transfers",
    categoryLabel: "Send & receive",
    excerpt:
      "Open the Receive page to view the address you can share with senders.",
    readTime: "2 min read",
  },
  {
    title: "Review a transfer before confirming",
    category: "transfers",
    categoryLabel: "Send & receive",
    excerpt:
      "Check the amount, address, and any network details to avoid mistakes.",
    readTime: "3 min read",
  },
  {
    title: "Preview an asset swap",
    category: "swap",
    categoryLabel: "Swap & convert",
    excerpt:
      "Choose the assets and amount, then review an estimate before you continue.",
    readTime: "3 min read",
  },
  {
    title: "Understanding exchange rates",
    category: "swap",
    categoryLabel: "Swap & convert",
    excerpt:
      "Learn how a preview rate is calculated from the assets you select.",
    readTime: "4 min read",
  },
  {
    title: "Adjust slippage tolerance",
    category: "swap",
    categoryLabel: "Swap & convert",
    excerpt:
      "Set the maximum price movement you are willing to accept on an exchange.",
    readTime: "3 min read",
  },
  {
    title: "Manage your card",
    category: "cards",
    categoryLabel: "Cards",
    excerpt:
      "View your card details, preferences, and activity from the Card page.",
    readTime: "3 min read",
  },
  {
    title: "Freeze or unfreeze a card",
    category: "cards",
    categoryLabel: "Cards",
    excerpt:
      "Temporarily block card use when you need to pause spending.",
    readTime: "2 min read",
  },
  {
    title: "Read your card activity",
    category: "cards",
    categoryLabel: "Cards",
    excerpt:
      "Understand what appears in the card activity list and when it updates.",
    readTime: "2 min read",
  },
  {
    title: "How transaction fees work",
    category: "fees",
    categoryLabel: "Fees & limits",
    excerpt:
      "Fees can vary by network and asset. Review them before you confirm a transfer.",
    readTime: "4 min read",
  },
  {
    title: "Daily sending limits",
    category: "fees",
    categoryLabel: "Fees & limits",
    excerpt:
      "Limits help protect your account and may depend on your verification level.",
    readTime: "3 min read",
  },
  {
    title: "Verification levels explained",
    category: "fees",
    categoryLabel: "Fees & limits",
    excerpt:
      "Learn how account verification can affect limits and available features.",
    readTime: "4 min read",
  },
];

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      "Select Create new wallet from the welcome screen, then register with your email, country, and a password. Your profile is saved so you can sign in later.",
  },
  {
    question: "I forgot my password. What should I do?",
    answer:
      "On the sign-in screen, choose Password Recovery and enter your email. A reset link will be sent to that address.",
  },
  {
    question: "Why do some balances show as a demo value?",
    answer:
      "Market prices and card activity are sample values used to demonstrate the interface. Live market data and payment services are not connected yet, so no real funds move.",
  },
  {
    question: "Can I use QuiloxLedger on my phone?",
    answer:
      "Yes. The wallet is designed to work on phones, tablets, and desktop. Key actions such as Send, Receive, Swap, and Card are available from the wallet navigation.",
  },
  {
    question: "How do I change my preferred currency?",
    answer:
      "Open Settings and choose your currency. The dashboard and asset list will display values in the currency you select.",
  },
  {
    question: "How is my account information protected?",
    answer:
      "Sign-in is handled by our authentication provider and your profile is stored securely. Use a strong, unique password and never share your credentials.",
  },
  {
    question: "Can I transfer funds to another wallet?",
    answer:
      "The Send page lets you enter a destination and amount. Always review the details carefully before confirming a transfer.",
  },
  {
    question: "Where can I get more help?",
    answer:
      "Sign in for account-specific support, or review the developer documentation for integration questions.",
  },
];

export default function HelpCenterPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">(
    "all",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const trimmedQuery = query.trim().toLowerCase();

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === "all" || article.category === activeCategory;
      const matchesQuery =
        trimmedQuery === "" ||
        article.title.toLowerCase().includes(trimmedQuery) ||
        article.excerpt.toLowerCase().includes(trimmedQuery) ||
        article.categoryLabel.toLowerCase().includes(trimmedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, trimmedQuery]);

  function focusArticles() {
    document
      .getElementById("articles")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectCategory(id: CategoryId | "all") {
    setActiveCategory(id);
    focusArticles();
  }

  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-blue-50 via-white to-white px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 dark:border-zinc-800 dark:from-blue-950/40 dark:via-zinc-950 dark:to-zinc-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/10"
        />

        <div className="relative mx-auto w-full max-w-[1440px]">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              <HelpIcon name="book" className="h-3.5 w-3.5" />
              Help Center
            </span>
            <h1 className="mt-5 text-pretty text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl dark:text-white">
              How can we help you today?
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base dark:text-zinc-300">
              Search guides, learn how each wallet feature works, and find
              answers to common questions.
            </p>

            <label className="relative mx-auto mt-8 block max-w-xl">
              <span className="sr-only">Search the help center</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                <HelpIcon name="search" className="h-[18px] w-[18px]" />
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for a topic, feature, or question"
                className="h-14 w-full rounded-2xl border border-zinc-200 bg-white pl-12 pr-4 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {[
                "Create account",
                "Reset password",
                "Send funds",
                "Swap",
              ].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setQuery(topic);
                    setActiveCategory("all");
                    focusArticles();
                  }}
                  className="rounded-full border border-zinc-200 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-blue-500/40 dark:hover:text-blue-300"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">
            Browse by category
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Pick a topic to jump straight to the most relevant guides.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const active = activeCategory === category.id;
            const count = articles.filter(
              (article) => article.category === category.id,
            ).length;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                aria-pressed={active}
                className={`group flex flex-col items-start gap-4 rounded-2xl border p-5 text-left transition ${
                  active
                    ? "border-blue-400 bg-blue-50/70 ring-4 ring-blue-500/10 dark:border-blue-500/50 dark:bg-blue-500/10"
                    : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-500/40"
                }`}
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl transition ${
                    active
                      ? "bg-blue-700 text-white"
                      : "bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white dark:bg-blue-500/15 dark:text-blue-300 dark:group-hover:bg-blue-600 dark:group-hover:text-white"
                  }`}
                >
                  <HelpIcon name={category.icon} />
                </span>
                <span className="flex-1">
                  <span className="block text-base font-semibold text-zinc-950 dark:text-white">
                    {category.title}
                  </span>
                  <span className="mt-1.5 block text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {category.description}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  {count} articles
                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        id="articles"
        className="scroll-mt-24 border-y border-zinc-200 bg-zinc-50/70 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900/40"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">
                {activeCategory === "all"
                  ? "Popular articles"
                  : categories.find((item) => item.id === activeCategory)
                      ?.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {filteredArticles.length}{" "}
                {filteredArticles.length === 1 ? "article" : "articles"}
                {trimmedQuery ? ` matching “${query.trim()}”` : ""}
              </p>
            </div>
            {activeCategory !== "all" || trimmedQuery !== "" ? (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("all");
                  setQuery("");
                }}
                className="inline-flex h-9 items-center rounded-full border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          {filteredArticles.length > 0 ? (
            <div className="mt-8 grid gap-3">
              {filteredArticles.map((article) => (
                <article
                  key={article.title}
                  className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-[0_14px_34px_rgba(15,23,42,0.07)] dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-500/40"
                >
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white dark:bg-blue-500/15 dark:text-blue-300 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                    <HelpIcon
                      name={
                        categories.find(
                          (item) => item.id === article.category,
                        )?.icon ?? "book"
                      }
                      className="h-[18px] w-[18px]"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-950 sm:text-base dark:text-white">
                        {article.title}
                      </h3>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {article.categoryLabel}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {article.excerpt}
                    </p>
                    <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                      {article.readTime}
                    </p>
                  </div>
                  <span className="mt-1 hidden shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600 sm:block dark:text-zinc-600 dark:group-hover:text-blue-400">
                    →
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-950">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <HelpIcon name="search" />
              </span>
              <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">
                No articles found
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
                Try a different keyword or browse all categories instead.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                }}
                className="mt-5 inline-flex h-10 items-center rounded-full bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Show all articles
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Quick answers to the questions we hear most often.
          </p>

          <div className="mt-8 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {faqs.map((faq, index) => {
              const expanded = openFaq === index;
              return (
                <div key={faq.question}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`faq-panel-${index}`}
                      onClick={() => setOpenFaq(expanded ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-zinc-50 dark:hover:bg-white/5"
                    >
                      <span className="text-sm font-semibold text-zinc-950 sm:text-[15px] dark:text-white">
                        {faq.question}
                      </span>
                      <span
                        className={`shrink-0 text-zinc-400 transition-transform duration-200 dark:text-zinc-500 ${
                          expanded ? "rotate-180" : ""
                        }`}
                      >
                        <HelpIcon name="chevron" className="h-4 w-4" />
                      </span>
                    </button>
                  </h3>
                  {expanded ? (
                    <div
                      id={`faq-panel-${index}`}
                      className="px-5 pb-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
                    >
                      {faq.answer}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-950 via-blue-950 to-zinc-900 px-6 py-12 text-white sm:px-10 sm:py-14 dark:border-zinc-800">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
            />
            <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90">
                  <HelpIcon name="chat" className="h-3.5 w-3.5" />
                  Still need help?
                </span>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                  We are here to help you move with confidence
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Sign in for account-specific support, or review the
                  documentation for integration and product questions.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/welcome"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition hover:bg-white/90"
                >
                  <HelpIcon name="lock" className="h-4 w-4" />
                  Account support
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <HelpIcon name="book" className="h-4 w-4" />
                  Developer docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
