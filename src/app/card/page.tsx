"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  MobileWalletNav,
  WalletPageHeader,
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
    case "eyeOff":
      return (
        <svg {...props}>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5" />
          <path d="M9.9 5.1A10.9 10.9 0 0 1 12 5c6.2 0 9.5 6 9.5 6a17.6 17.6 0 0 1-3.2 3.9" />
          <path d="M6.6 6.6A17.6 17.6 0 0 0 2.5 11s3.3 6 9.5 6c1.7 0 3.3-.4 4.7-1.1" />
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
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="m5 12 5 5 9-11" />
        </svg>
      );
    case "copy":
      return (
        <svg {...props}>
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      );
    default:
      return null;
  }
}

type PreferenceKey =
  | "onlinePayments"
  | "contactless"
  | "internationalPayments"
  | "atmWithdrawals";

type Currency = "USD" | "EUR" | "GBP" | "NGN";

interface VirtualCard {
  cardholderName: string;
  cardNumber: string;
  last4: string;
  expiry: string;
  cvv: string;
  brand: string;
  currency: string;
  status: "active";
  frozen: boolean;
  preferences: Record<PreferenceKey, boolean>;
  createdAt: string | null;
  updatedAt: string | null;
}

const cardCurrencies: { value: Currency; label: string }[] = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "NGN", label: "Nigerian Naira (NGN)" },
];

const preferenceRows: {
  key: PreferenceKey;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    key: "onlinePayments",
    title: "Online payments",
    description: "Allow online purchases",
    icon: "card",
  },
  {
    key: "contactless",
    title: "Contactless",
    description: "Tap-to-pay transactions",
    icon: "contactless",
  },
  {
    key: "internationalPayments",
    title: "International",
    description: "Payments outside your country",
    icon: "globe",
  },
  {
    key: "atmWithdrawals",
    title: "ATM withdrawals",
    description: "Cash withdrawals at ATMs",
    icon: "lock",
  },
];

const preferenceLabels: Record<PreferenceKey, string> = {
  onlinePayments: "Online payments",
  contactless: "Contactless payments",
  internationalPayments: "International payments",
  atmWithdrawals: "ATM withdrawals",
};

function formatCardNumber(value: string) {
  return value.replace(/(.{4})/g, "$1 ").trim();
}

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface PreferenceRowProps {
  title: string;
  description: string;
  icon: string;
  checked: boolean;
  onChange: () => void;
}

function PreferenceRow({
  title,
  description,
  icon,
  checked,
  onChange,
}: PreferenceRowProps) {
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
        aria-label={title}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
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

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold tracking-tight text-[#20252b]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 flex-1 rounded-xl border border-[#e4e8eb] text-sm font-semibold text-[#46505a] transition hover:bg-[#f7f8f9] active:scale-[.98]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 flex-1 rounded-xl text-sm font-semibold text-white transition active:scale-[.98] ${
              danger
                ? "bg-[#c0392b] hover:bg-[#a93226]"
                : "bg-[#075b9d] hover:bg-[#064c82]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [cardType, setCardType] = useState<"virtual" | "physical">("virtual");
  const [card, setCard] = useState<VirtualCard | null>(null);
  const [cardLoading, setCardLoading] = useState(true);
  const [cardError, setCardError] = useState("");
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [notice, setNotice] = useState("");

  // Application form
  const [applicantName, setApplicantName] = useState("");
  const [applicantCurrency, setApplicantCurrency] = useState<Currency>("USD");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  // modals
  const [replaceConfirm, setReplaceConfirm] = useState(false);
  const [freezeConfirm, setFreezeConfirm] = useState(false);

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

  const loadCard = useCallback(async (currentUser: User) => {
    setCardLoading(true);
    setCardError("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/cards/virtual", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = (await response.json().catch(() => ({}))) as {
        card?: VirtualCard | null;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "We couldn’t load your card right now.");
      }
      setCard(data.card ?? null);
      if (data.card?.cardholderName) {
        setApplicantName(data.card.cardholderName);
      }
    } catch (caught) {
      setCardError(
        caught instanceof Error
          ? caught.message
          : "We couldn’t load your card right now.",
      );
    } finally {
      setCardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadCard(user);
  }, [user, loadCard]);

  useEffect(() => {
    if (!user || card) return;
    setApplicantName((current) => current || user.displayName || "");
  }, [user, card]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  const defaultCardholder = useMemo(() => {
    const raw = user?.displayName || user?.email?.split("@")[0] || "";
    return raw.toUpperCase();
  }, [user]);

  const maskedNumber = card ? `••••  ••••  ••••  ${card.last4}` : "";
  const fullNumber = card ? formatCardNumber(card.cardNumber) : "";

  async function updateCard(payload: Record<string, unknown>, message: string) {
    if (!user || !card) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/cards/virtual", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as {
        card?: VirtualCard | null;
        error?: string;
      };
      if (!response.ok || !data.card) {
        throw new Error(
          data.error ?? "We couldn’t update your card right now.",
        );
      }
      setCard(data.card);
      showNotice(message);
    } catch (caught) {
      showNotice(
        caught instanceof Error
          ? caught.message
          : "We couldn’t update your card right now.",
      );
    }
  }

  async function handleApplyCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    if (applicantName.trim().length < 3) {
      setApplyError("Enter the cardholder name exactly as it should appear.");
      return;
    }
    if (!agreedToTerms) {
      setApplyError("Please accept the card terms to continue.");
      return;
    }

    setApplying(true);
    setApplyError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/cards/virtual", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardholderName: applicantName.trim(),
          currency: applicantCurrency,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        card?: VirtualCard | null;
        error?: string;
      };
      if (!response.ok || !data.card) {
        throw new Error(
          data.error ?? "We couldn’t create your card right now.",
        );
      }
      setCard(data.card);
      setAgreedToTerms(false);
      showNotice("Your virtual card has been issued");
    } catch (caught) {
      setApplyError(
        caught instanceof Error
          ? caught.message
          : "We couldn’t create your card right now.",
      );
    } finally {
      setApplying(false);
    }
  }

  function togglePreference(key: PreferenceKey) {
    if (!card) return;
    const next = !card.preferences[key];
    void updateCard(
      { preferences: { [key]: next } },
      `${preferenceLabels[key]} ${next ? "enabled" : "disabled"}`,
    );
  }

  function handleReplaceCard() {
    setReplaceConfirm(false);
    void updateCard(
      { regenerate: true },
      "Replacement card issued with new details",
    );
  }

  function handleFreezeToggle() {
    if (!card) return;
    if (card.frozen) {
      void updateCard(
        { frozen: false },
        "Card unfrozen. You can now make payments.",
      );
      return;
    }
    setFreezeConfirm(true);
  }

  function confirmFreeze() {
    setFreezeConfirm(false);
    void updateCard({ frozen: true }, "Card frozen. All payments are blocked.");
  }

  function copyCardNumber() {
    if (!card) return;
    navigator.clipboard?.writeText(card.cardNumber).catch(() => {});
    showNotice("Card number copied");
  }

  if (checking) {
    return (
      <div className="grid min-h-[70vh] flex-1 place-items-center bg-[#f7f8fa] px-4">
        <p className="text-sm text-zinc-500">Loading your card…</p>
      </div>
    );
  }

  return (
    <div className="qlx-wallet-app min-h-screen flex-1 overflow-x-hidden bg-[#f7f8fa] text-[#25282d] dark:bg-[#101619] dark:text-[#e9eef0]">
      <WalletPageHeader active="Card" />

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
            onClick={() => {
              if (card) {
                showNotice("Physical card requests will be available soon.");
                return;
              }
              setCardType("virtual");
              document
                .getElementById("request-virtual-card")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#075b9d] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#064c82] active:scale-[.98] sm:h-11 sm:px-5 sm:text-sm"
          >
            <CardIcon name="plus" className="h-4 w-4" />
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
              {card
                ? "Physical card issuance is coming soon. Your virtual card is active and ready to use for online and contactless payments."
                : "Physical card issuance is coming soon. Request a virtual card below to start paying online and contactless."}
            </p>
          </div>
        ) : null}

        {cardError ? (
          <div
            role="alert"
            className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-[#f3d7d3] bg-[#fdf4f3] p-4"
          >
            <p className="text-sm leading-6 text-[#a4443a]">{cardError}</p>
            <button
              type="button"
              onClick={() => user && loadCard(user)}
              className="shrink-0 rounded-lg border border-[#e7d3d0] bg-white px-3 py-1.5 text-xs font-semibold text-[#a4443a] transition hover:bg-[#fdf4f3] active:scale-[.98]"
            >
              Retry
            </button>
          </div>
        ) : null}

        {cardLoading ? (
          <div className="mt-5 rounded-2xl border border-[#e9ecef] bg-white p-8 text-center shadow-[0_8px_24px_rgba(25,36,50,0.035)]">
            <p className="text-sm text-[#8a9199]">Loading your card…</p>
          </div>
        ) : card ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <section className="min-w-0 rounded-2xl border border-[#e9ecef] bg-white p-4 shadow-[0_8px_24px_rgba(25,36,50,0.035)] sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#30363d] sm:text-base">
                    {cardType === "virtual" ? "Virtual card" : "Physical card"}
                  </h2>
                  <p className="mt-1 text-[11px] text-[#9298a0] sm:text-xs">
                    {card.frozen
                      ? "Card is frozen"
                      : `Active · issued ${formatDate(card.createdAt) || "just now"}`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${
                    card.frozen
                      ? "bg-[#fbe9e7] text-[#b54f4f]"
                      : "bg-[#e8f6ee] text-[#16875a]"
                  }`}
                >
                  {card.frozen ? "Frozen" : "Active"}
                </span>
              </div>

              <div
                className={`relative aspect-[1.62] w-full overflow-hidden rounded-[18px] bg-[#0c2932] p-5 text-white shadow-[0_18px_36px_rgba(9,39,49,.22)] transition sm:rounded-[22px] sm:p-7 ${
                  card.frozen ? "grayscale" : ""
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
                      {cardType}
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
                        {detailsVisible ? fullNumber : maskedNumber}
                      </p>
                      <div className="mt-3 flex items-end gap-6 sm:mt-4 sm:gap-8">
                        <div className="min-w-0">
                          <p className="text-[7px] font-semibold uppercase tracking-[.16em] text-white/50 sm:text-[8px]">
                            Cardholder
                          </p>
                          <p className="mt-1 max-w-[150px] truncate text-[9px] font-semibold uppercase tracking-[.1em] sm:max-w-[230px] sm:text-[11px]">
                            {card.cardholderName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[7px] font-semibold uppercase tracking-[.16em] text-white/50 sm:text-[8px]">
                            Expires
                          </p>
                          <p className="mt-1 text-[9px] font-semibold tracking-[.1em] sm:text-[11px]">
                            {card.expiry}
                          </p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-[7px] font-semibold uppercase tracking-[.16em] text-white/50 sm:text-[8px]">
                            CVV
                          </p>
                          <p className="mt-1 text-[9px] font-semibold tracking-[.1em] sm:text-[11px]">
                            {detailsVisible ? card.cvv : "•••"}
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
                {card.frozen ? (
                  <div className="absolute inset-0 grid place-items-center bg-[#101a1d]/45 backdrop-blur-[1px]">
                    <span className="rounded-full border border-white/30 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-[.15em]">
                      Card frozen
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] leading-4 text-[#8a9199]">
                  Keep your card details secure. Never share your CVV or PIN.
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDetailsVisible((v) => !v)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-[#075b9d] transition hover:bg-[#f0f6fb] active:scale-[.98]"
                  >
                    <CardIcon
                      name={detailsVisible ? "eyeOff" : "eye"}
                      className="h-4 w-4"
                    />
                    {detailsVisible ? "Hide details" : "Show details"}
                  </button>
                  <button
                    type="button"
                    onClick={copyCardNumber}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-[#075b9d] transition hover:bg-[#f0f6fb] active:scale-[.98]"
                    aria-label="Copy card number"
                  >
                    <CardIcon name="copy" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[#eff1f3] pt-4">
                <button
                  type="button"
                  aria-pressed={card.frozen}
                  onClick={handleFreezeToggle}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition active:scale-[.98] ${
                    card.frozen
                      ? "border-[#f0d6d6] bg-[#fff6f6] text-[#b54f4f]"
                      : "border-[#e7eaed] text-[#48515a] hover:bg-[#f7f8f9]"
                  }`}
                >
                  <CardIcon name="freeze" className="h-4 w-4" />
                  {card.frozen ? "Unfreeze card" : "Freeze card"}
                </button>
                <button
                  type="button"
                  onClick={() => setReplaceConfirm(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e7eaed] px-3 text-xs font-semibold text-[#48515a] transition hover:bg-[#f7f8f9] active:scale-[.98]"
                >
                  <CardIcon name="shield" className="h-4 w-4" />
                  Replace card
                </button>
              </div>
            </section>

            <div className="space-y-5">
              <section className="rounded-2xl border border-[#e9ecef] bg-white px-4 shadow-[0_8px_24px_rgba(25,36,50,0.035)] sm:px-5">
                <div className="border-b border-[#eff1f3] py-4">
                  <h2 className="text-sm font-bold text-[#30363d]">
                    Card preferences
                  </h2>
                  <p className="mt-1 text-[11px] leading-5 text-[#9198a0]">
                    Control how and where your card can be used.
                  </p>
                </div>
                {preferenceRows.map((row, index) => (
                  <div
                    key={row.key}
                    className={index === 0 ? "" : "border-t border-[#eff1f3]"}
                  >
                    <PreferenceRow
                      title={row.title}
                      description={row.description}
                      icon={row.icon}
                      checked={card.preferences[row.key]}
                      onChange={() => togglePreference(row.key)}
                    />
                  </div>
                ))}
              </section>
            </div>
          </div>
        ) : (
          <section
            id="request-virtual-card"
            className="mt-5 overflow-hidden rounded-2xl border border-[#e9ecef] bg-white shadow-[0_8px_24px_rgba(25,36,50,0.035)]"
          >
            <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#edf5fb] px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#075b9d]">
                  <CardIcon name="card" className="h-3.5 w-3.5" />
                  Virtual card
                </span>
                <h2 className="mt-4 text-lg font-bold tracking-tight text-[#20252b] sm:text-xl">
                  Request your Quilox virtual card
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#77808a]">
                  Issue a virtual card to your QuiloxLedger account and start
                  paying online straight away. Your card details are stored on
                  your account and shown only to you.
                </p>
                <ul className="mt-6 space-y-3.5">
                  {[
                    {
                      icon: "shield",
                      title: "Issued instantly",
                      description: "No waiting for approval or delivery.",
                    },
                    {
                      icon: "globe",
                      title: "Pay online and in store",
                      description: "Works for online and contactless payments.",
                    },
                    {
                      icon: "freeze",
                      title: "Full control",
                      description:
                        "Freeze, replace, or adjust preferences anytime.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f3f6f8] text-[#52606b]">
                        <CardIcon name={item.icon} className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#30363d]">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-[#8a9199]">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <form
                onSubmit={handleApplyCard}
                className="min-w-0 rounded-2xl border border-[#e9ecef] bg-[#fbfcfd] p-4 sm:p-5"
              >
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-[#52606b]">
                    Cardholder name
                  </span>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(event) => setApplicantName(event.target.value)}
                    placeholder="Name as it should appear on the card"
                    autoComplete="name"
                    required
                    className="h-11 w-full rounded-xl border border-[#e4e8eb] bg-white px-3 text-sm text-[#25282d] outline-none transition placeholder:text-[#a6adb5] focus:border-[#075b9d] focus:ring-2 focus:ring-[#075b9d]/15"
                  />
                  <span className="mt-1.5 block text-[11px] text-[#9198a0]">
                    Suggested: {defaultCardholder || "your full name"}
                  </span>
                </label>

                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-semibold text-[#52606b]">
                    Card currency
                  </span>
                  <select
                    value={applicantCurrency}
                    onChange={(event) =>
                      setApplicantCurrency(event.target.value as Currency)
                    }
                    className="h-11 w-full rounded-xl border border-[#e4e8eb] bg-white px-3 text-sm text-[#25282d] outline-none transition focus:border-[#075b9d] focus:ring-2 focus:ring-[#075b9d]/15"
                  >
                    {cardCurrencies.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mt-4 flex items-start gap-3 rounded-xl border border-[#e9ecef] bg-white p-3">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(event) => {
                      setAgreedToTerms(event.target.checked);
                      setApplyError("");
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#c9d2da] accent-[#075b9d]"
                  />
                  <span className="text-[11px] leading-5 text-[#6b7280]">
                    I confirm the cardholder name is correct and I accept the
                    Quilox virtual card terms.
                  </span>
                </label>

                {applyError ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl border border-[#f3d7d3] bg-[#fdf4f3] px-3 py-2.5 text-xs leading-5 text-[#a4443a]"
                  >
                    {applyError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={
                    applying ||
                    !agreedToTerms ||
                    applicantName.trim().length < 3
                  }
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#075b9d] text-sm font-semibold text-white transition hover:bg-[#064c82] active:scale-[.98] disabled:cursor-not-allowed disabled:bg-[#c3d2de]"
                >
                  <CardIcon name="plus" className="h-4 w-4" />
                  {applying ? "Issuing your card…" : "Request virtual card"}
                </button>
                <p className="mt-3 text-center text-[11px] leading-5 text-[#9198a0]">
                  One virtual card per account.
                </p>
              </form>
            </div>
          </section>
        )}
      </main>

      {/* Confirmation dialogs */}
      <ConfirmDialog
        open={replaceConfirm}
        title="Replace card"
        message="Requesting a replacement will deactivate your current card and issue a new one. A new card number and CVV will be generated. Continue?"
        confirmLabel="Replace card"
        danger
        onConfirm={handleReplaceCard}
        onCancel={() => setReplaceConfirm(false)}
      />
      <ConfirmDialog
        open={freezeConfirm}
        title="Freeze card"
        message="Freezing your card will block all payments and withdrawals until you unfreeze it. Continue?"
        confirmLabel="Freeze card"
        danger
        onConfirm={confirmFreeze}
        onCancel={() => setFreezeConfirm(false)}
      />

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
