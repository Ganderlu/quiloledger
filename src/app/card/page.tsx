"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  DesktopWalletNav,
  MobileWalletNav,
} from "../_components/WalletNavigation";

function CardIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
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
    case "chevron":
      return (
        <svg {...props}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "eye":
      return (
        <svg {...props}>
          <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "freeze":
      return (
        <svg {...props}>
          <path d="M12 2v20M4 6l16 12M20 6 4 18M8 4l4 3 4-3M8 20l4-3 4 3M3 10l4 2-1 5M21 10l-4 2 1 5" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "globe":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "contactless":
      return (
        <svg {...props}>
          <path d="M8 8a6 6 0 0 0 0 8M12 5a10 10 0 0 0 0 14M16 2a14 14 0 0 0 0 20" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
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

function PreferenceRow({
  title,
  description,
  icon,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  icon: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f3f6f8] text-[#52606b]">
        <CardIcon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#30363d]">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-[#8a9199]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${title} demo setting`}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#16875a]" : "bg-[#d4d9de]"
        }`}
      >
        <span
          className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-[22px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

export default function CardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [cardType, setCardType] = useState<"virtual" | "physical">("virtual");
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [onlinePayments, setOnlinePayments] = useState(true);
  const [contactless, setContactless] = useState(true);
  const [internationalPayments, setInternationalPayments] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/login");
  }

  const cardholder =
    user?.displayName || user?.email?.split("@")[0] || "QUILOX MEMBER";

  if (checking) {
    return (
      <div className="grid min-h-[70vh] flex-1 place-items-center bg-[#f7f8fa] px-4">
        <p className="text-sm text-zinc-500">Loading your card…</p>
      </div>
    );
  }

  return (
    <div className="qlx-wallet-app min-h-screen flex-1 bg-[#f7f8fa] text-[#25282d] dark:bg-[#101619] dark:text-[#e9eef0]">
      <div className="h-1 w-full bg-[#27c84a]" />
      <header className="sticky top-0 z-30 border-b border-[#eceef1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between gap-4 px-3 sm:px-6 lg:px-10">
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
          <DesktopWalletNav active="Card" />
          <div className="relative shrink-0">
            <button
              type="button"
              aria-expanded={accountMenuOpen}
              aria-label="Open account menu"
              onClick={() => setAccountMenuOpen((open) => !open)}
              className="flex h-9 items-center gap-2 rounded-full border border-[#e6e9ec] px-2.5 text-xs font-semibold text-[#454c53] transition hover:bg-[#f7f8fa] sm:px-3"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e6f4ec] text-[11px] font-bold text-[#188453]">
                {cardholder.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-32 truncate sm:block">
                {cardholder}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="hidden h-3.5 w-3.5 sm:block"
              >
                <path
                  d="m5 7.5 5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {accountMenuOpen ? (
              <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-[#e8eaee] bg-white p-4 shadow-xl">
                <p className="truncate text-sm font-semibold">{cardholder}</p>
                <p className="mt-1 truncate text-xs text-[#737a83]">
                  {user?.email}
                </p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-4 h-9 w-full rounded-lg border border-[#e8eaee] text-xs font-semibold text-[#4b5158] hover:bg-[#f7f8fa]"
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-9 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#16875a]">
              Quilox cards
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#20252b] sm:text-[30px]">
              Your cards
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#77808a]">
              Manage your card settings and keep spending controls close at
              hand.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              showNotice(
                "Card issuing is not available yet. This is a preview.",
              )
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#075b9d] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#064c82] active:scale-[.98] sm:h-11 sm:px-5 sm:text-sm"
          >
            <span className="text-lg leading-none">+</span>
            Request a card
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Card type"
          className="mt-6 flex w-full max-w-[360px] rounded-xl border border-[#e8ebee] bg-white p-1"
        >
          {(["virtual", "physical"] as const).map((type) => {
            const selected = cardType === type;
            return (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setCardType(type)}
                className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-semibold capitalize transition sm:text-sm ${
                  selected
                    ? "bg-[#edf5fb] text-[#075b9d] shadow-sm"
                    : "text-[#818991] hover:text-[#3d454d]"
                }`}
              >
                {type} card
                {type === "physical" ? (
                  <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-wide text-[#a1a7ad]">
                    Soon
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {cardType === "physical" ? (
          <div
            role="status"
            className="mt-4 flex items-start gap-3 rounded-xl border border-[#dce9f2] bg-[#f0f7fc] p-4 text-sm text-[#465d6d]"
          >
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[#075b9d]">
              <CardIcon name="card" className="h-4 w-4" />
            </span>
            <p className="leading-6">
              Physical cards are not available yet. You can preview the design
              below; requesting or activating a card is not enabled.
            </p>
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="min-w-0 rounded-2xl border border-[#e9ecef] bg-white p-4 shadow-[0_8px_24px_rgba(25,36,50,0.035)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#30363d] sm:text-base">
                  {cardType === "virtual"
                    ? "Virtual card preview"
                    : "Physical card preview"}
                </h2>
                <p className="mt-1 text-[11px] text-[#9298a0] sm:text-xs">
                  Preview only · not enabled for payments
                </p>
              </div>
              <span className="rounded-full bg-[#fff5df] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#a57313]">
                Demo
              </span>
            </div>

            <div
              className={`relative aspect-[1.62] w-full overflow-hidden rounded-[18px] bg-[#0c2932] p-5 text-white shadow-[0_18px_36px_rgba(9,39,49,.22)] transition sm:rounded-[22px] sm:p-7 ${
                isFrozen ? "grayscale" : ""
              }`}
            >
              <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-2 -top-16 h-56 w-56 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -bottom-36 left-12 h-72 w-72 rounded-full bg-[#16875a]/30 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-[17px] w-[17px]"
                        fill="none"
                      >
                        <path
                          d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M8 12h8M12 8v8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="text-[13px] font-semibold tracking-tight sm:text-base">
                      Quilox
                    </span>
                  </div>
                  <span className="rounded-full border border-white/20 px-2 py-1 text-[8px] font-bold uppercase tracking-[.15em] text-white/75 sm:text-[9px]">
                    {cardType} · preview
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex h-7 w-9 items-center justify-center rounded-md border border-[#dbc88e]/70 bg-gradient-to-br from-[#e8d9ab] to-[#a99664] sm:mb-4 sm:h-9 sm:w-12">
                      <span className="grid grid-cols-2 gap-[2px]">
                        <span className="h-2.5 w-3 rounded-[2px] border border-[#766b4e]/50 sm:h-3.5 sm:w-4" />
                        <span className="h-2.5 w-3 rounded-[2px] border border-[#766b4e]/50 sm:h-3.5 sm:w-4" />
                        <span className="h-2.5 w-3 rounded-[2px] border border-[#766b4e]/50 sm:h-3.5 sm:w-4" />
                        <span className="h-2.5 w-3 rounded-[2px] border border-[#766b4e]/50 sm:h-3.5 sm:w-4" />
                      </span>
                    </div>
                    <p className="text-[12px] font-medium tracking-[.11em] sm:text-base sm:tracking-[.16em]">
                      {detailsVisible
                        ? "4821 0842 9000 4821"
                        : "••••  ••••  ••••  4821"}
                    </p>
                    <div className="mt-3 flex items-end gap-6 sm:mt-4 sm:gap-8">
                      <div className="min-w-0">
                        <p className="text-[7px] font-semibold uppercase tracking-[.16em] text-white/50 sm:text-[8px]">
                          Cardholder
                        </p>
                        <p className="mt-1 max-w-[150px] truncate text-[9px] font-semibold uppercase tracking-[.1em] sm:max-w-[230px] sm:text-[11px]">
                          {cardholder}
                        </p>
                      </div>
                      <div>
                        <p className="text-[7px] font-semibold uppercase tracking-[.16em] text-white/50 sm:text-[8px]">
                          Expires
                        </p>
                        <p className="mt-1 text-[9px] font-semibold tracking-[.1em] sm:text-[11px]">
                          12/30
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-1 text-right">
                    <CardIcon
                      name="contactless"
                      className="ml-auto h-5 w-5 rotate-90 text-white/60 sm:h-6 sm:w-6"
                    />
                    <span className="mt-2 block text-[15px] font-black italic tracking-tight text-white/90 sm:text-lg">
                      QLX
                    </span>
                  </div>
                </div>
              </div>
              {isFrozen ? (
                <div className="absolute inset-0 grid place-items-center bg-[#101a1d]/35 backdrop-blur-[1px]">
                  <span className="rounded-full border border-white/30 bg-black/35 px-4 py-2 text-xs font-bold uppercase tracking-[.15em]">
                    Preview frozen
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] leading-4 text-[#8a9199]">
                Sample card details only. This is not a payment card.
              </p>
              <button
                type="button"
                onClick={() => setDetailsVisible((visible) => !visible)}
                className="inline-flex h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-[#075b9d] transition hover:bg-[#f0f6fb] active:scale-[.98]"
              >
                <CardIcon name="eye" className="h-4 w-4" />
                {detailsVisible ? "Hide number" : "Show sample number"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[#eff1f3] pt-4 sm:grid-cols-3">
              <button
                type="button"
                aria-pressed={isFrozen}
                onClick={() => setIsFrozen((frozen) => !frozen)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition active:scale-[.98] ${
                  isFrozen
                    ? "border-[#f0d6d6] bg-[#fff6f6] text-[#b54f4f]"
                    : "border-[#e7eaed] text-[#48515a] hover:bg-[#f7f8f9]"
                }`}
              >
                <CardIcon name="freeze" className="h-4 w-4" />
                {isFrozen ? "Unfreeze preview" : "Freeze preview"}
              </button>
              <button
                type="button"
                onClick={() => showNotice("Card issuing is not available yet.")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e7eaed] px-3 text-xs font-semibold text-[#48515a] transition hover:bg-[#f7f8f9] active:scale-[.98]"
              >
                <CardIcon name="lock" className="h-4 w-4" />
                Set PIN
              </button>
              <button
                type="button"
                onClick={() => showNotice("Card issuing is not available yet.")}
                className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e7eaed] px-3 text-xs font-semibold text-[#48515a] transition hover:bg-[#f7f8f9] active:scale-[.98] sm:col-span-1"
              >
                <CardIcon name="shield" className="h-4 w-4" />
                Replace card
              </button>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-[#e9ecef] bg-white p-5 shadow-[0_8px_24px_rgba(25,36,50,0.035)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-[#89919a]">
                    Available card balance
                  </p>
                  <p className="mt-2 text-[30px] font-bold tracking-tight text-[#20252b] sm:text-4xl">
                    ₦0.00
                  </p>
                </div>
                <span className="rounded-full bg-[#fff5df] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[.1em] text-[#a57313]">
                  Not issued
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#8b929a]">
                A card balance will be shown here after card services are
                available.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    showNotice("Card funding is not available yet.")
                  }
                  className="h-10 rounded-xl bg-[#075b9d] px-3 text-xs font-semibold text-white transition hover:bg-[#064c82] active:scale-[.98]"
                >
                  Add money
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showNotice("Card spending is not available yet.")
                  }
                  className="h-10 rounded-xl border border-[#e4e8eb] px-3 text-xs font-semibold text-[#46505a] transition hover:bg-[#f7f8f9] active:scale-[.98]"
                >
                  View limits
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-[#e9ecef] bg-white px-4 shadow-[0_8px_24px_rgba(25,36,50,0.035)] sm:px-5">
              <div className="border-b border-[#eff1f3] py-4">
                <h2 className="text-sm font-bold text-[#30363d]">
                  Card preferences
                </h2>
                <p className="mt-1 text-[11px] leading-5 text-[#9198a0]">
                  Demo controls only; they do not change a real card.
                </p>
              </div>
              <PreferenceRow
                title="Online payments"
                description="Allow online purchases"
                icon="card"
                checked={onlinePayments}
                onChange={() => setOnlinePayments((enabled) => !enabled)}
              />
              <div className="border-t border-[#eff1f3]">
                <PreferenceRow
                  title="Contactless"
                  description="Tap-to-pay transactions"
                  icon="contactless"
                  checked={contactless}
                  onChange={() => setContactless((enabled) => !enabled)}
                />
              </div>
              <div className="border-t border-[#eff1f3]">
                <PreferenceRow
                  title="International"
                  description="Payments outside your country"
                  icon="globe"
                  checked={internationalPayments}
                  onChange={() =>
                    setInternationalPayments((enabled) => !enabled)
                  }
                />
              </div>
            </section>
          </div>
        </div>

        <section className="mt-5 rounded-2xl border border-[#e9ecef] bg-white p-5 shadow-[0_8px_24px_rgba(25,36,50,0.035)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#30363d] sm:text-base">
                Recent card activity
              </h2>
              <p className="mt-1 text-xs text-[#9298a0]">
                Your card transactions will appear here.
              </p>
            </div>
            <span className="rounded-full bg-[#f3f5f6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#7e8790]">
              No activity
            </span>
          </div>
          <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-[#e4e8eb] bg-[#fafbfc] px-5 py-8 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#7f8a93] shadow-sm">
              <CardIcon name="card" className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-[#535c64]">
              No card transactions yet
            </p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-[#9299a1]">
              Transactions will show here once card issuing and payments are
              enabled for your account.
            </p>
          </div>
        </section>
      </main>

      {notice ? (
        <div
          role="status"
          className="fixed left-1/2 top-[72px] z-50 -translate-x-1/2 rounded-full bg-[#20252b] px-4 py-2.5 text-center text-xs font-medium text-white shadow-lg sm:top-auto sm:bottom-8"
        >
          {notice}
        </div>
      ) : null}

      <MobileWalletNav active="Card" />
    </div>
  );
}
