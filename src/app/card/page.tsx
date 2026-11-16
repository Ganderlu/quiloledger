"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
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

interface ModalShellProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function ModalShell({ open, title, onClose, children }: ModalShellProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-[#20252b]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-[#7a828b] transition hover:bg-[#f3f5f7] active:scale-95"
          >
            <CardIcon name="close" className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
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
  const [atmWithdrawals, setAtmWithdrawals] = useState(true);
  const [cardBalance, setCardBalance] = useState(42850);
  const [notice, setNotice] = useState("");

  // modals
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [limitsModalOpen, setLimitsModalOpen] = useState(false);
  const [replaceConfirm, setReplaceConfirm] = useState(false);
  const [freezeConfirm, setFreezeConfirm] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [pinValue, setPinValue] = useState("");
  const [pinConfirmValue, setPinConfirmValue] = useState("");
  const [pinStage, setPinStage] = useState<"enter" | "confirm">("enter");
  const [dailyLimit, setDailyLimit] = useState(100000);
  const [monthlyLimit, setMonthlyLimit] = useState(500000);

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
    window.setTimeout(() => setNotice(""), 3000);
  }

  const cardholder = useMemo(() => {
    const raw =
      user?.displayName || user?.email?.split("@")[0] || "QUILOX MEMBER";
    return raw.toUpperCase();
  }, [user]);

  const maskedNumber = "••••  ••••  ••••  4821";
  const fullNumber = "4821 0842 9000 4821";

  const togglePreference = (key: PreferenceKey) => {
    if (key === "onlinePayments") {
      setOnlinePayments((v) => {
        showNotice(v ? "Online payments disabled" : "Online payments enabled");
        return !v;
      });
    } else if (key === "contactless") {
      setContactless((v) => {
        showNotice(
          v ? "Contactless payments disabled" : "Contactless payments enabled",
        );
        return !v;
      });
    } else if (key === "internationalPayments") {
      setInternationalPayments((v) => {
        showNotice(
          v
            ? "International payments disabled"
            : "International payments enabled",
        );
        return !v;
      });
    } else {
      setAtmWithdrawals((v) => {
        showNotice(v ? "ATM withdrawals disabled" : "ATM withdrawals enabled");
        return !v;
      });
    }
  };

  function handleFundCard() {
    const amount = Number(fundAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showNotice("Enter a valid amount");
      return;
    }
    if (amount > 1000000) {
      showNotice("Maximum funding amount is ₦1,000,000");
      return;
    }
    setCardBalance((current) => current + amount);
    setFundAmount("");
    setFundModalOpen(false);
    showNotice(`₦${amount.toLocaleString()} added to your card`);
  }

  function handleSetPin() {
    if (pinValue.length !== 4) {
      showNotice("PIN must be 4 digits");
      return;
    }
    if (pinStage === "enter") {
      setPinStage("confirm");
      return;
    }
    if (pinValue !== pinConfirmValue) {
      showNotice("PINs do not match");
      setPinValue("");
      setPinConfirmValue("");
      setPinStage("enter");
      return;
    }
    setPinValue("");
    setPinConfirmValue("");
    setPinStage("enter");
    setPinModalOpen(false);
    showNotice("Card PIN updated successfully");
  }

  function handleSaveLimits() {
    if (dailyLimit < 1000 || monthlyLimit < dailyLimit) {
      showNotice("Enter valid spending limits");
      return;
    }
    setLimitsModalOpen(false);
    showNotice("Spending limits updated");
  }

  function handleReplaceCard() {
    setReplaceConfirm(false);
    showNotice("Card replacement requested. You will be notified when ready.");
  }

  function handleFreezeToggle() {
    if (!isFrozen) {
      setFreezeConfirm(true);
    } else {
      setIsFrozen(false);
      showNotice("Card unfrozen. You can now make payments.");
    }
  }

  function confirmFreeze() {
    setIsFrozen(true);
    setFreezeConfirm(false);
    showNotice("Card frozen. All payments are blocked.");
  }

  function copyCardNumber() {
    navigator.clipboard
      ?.writeText(fullNumber.replace(/\s/g, ""))
      .catch(() => {});
    showNotice("Card number copied");
  }

  if (checking) {
    return (
      <div className="grid min-h-[70vh] flex-1 place-items-center bg-[#f7f8fa] px-4">
        <p className="text-sm text-zinc-500">Loading your card…</p>
      </div>
    );
  }

  const formatNaira = (amount: number) =>
    `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="qlx-wallet-app min-h-screen flex-1 overflow-x-hidden bg-[#f7f8fa] text-[#25282d] dark:bg-[#101619] dark:text-[#e9eef0]">
      <div className="h-1 w-full bg-[#27c84a]" />
      <header className="sticky top-0 z-30 hidden bg-white/95 backdrop-blur md:block md:border-b md:border-[#eceef1]">
        <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-center gap-4 px-3 md:px-6 lg:px-10">
          <DesktopWalletNav active="Card" />
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
              showNotice("Physical card requests will be available soon.")
            }
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
              Physical card issuance is coming soon. Your virtual card is active
              and ready to use for online and contactless payments.
            </p>
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="min-w-0 rounded-2xl border border-[#e9ecef] bg-white p-4 shadow-[0_8px_24px_rgba(25,36,50,0.035)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#30363d] sm:text-base">
                  {cardType === "virtual" ? "Virtual card" : "Physical card"}
                </h2>
                <p className="mt-1 text-[11px] text-[#9298a0] sm:text-xs">
                  {isFrozen ? "Card is frozen" : "Active · ready for payments"}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${
                  isFrozen
                    ? "bg-[#fbe9e7] text-[#b54f4f]"
                    : "bg-[#e8f6ee] text-[#16875a]"
                }`}
              >
                {isFrozen ? "Frozen" : "Active"}
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
                      <div className="hidden sm:block">
                        <p className="text-[7px] font-semibold uppercase tracking-[.16em] text-white/50 sm:text-[8px]">
                          CVV
                        </p>
                        <p className="mt-1 text-[9px] font-semibold tracking-[.1em] sm:text-[11px]">
                          {detailsVisible ? "342" : "•••"}
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

            <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[#eff1f3] pt-4 sm:grid-cols-3">
              <button
                type="button"
                aria-pressed={isFrozen}
                onClick={handleFreezeToggle}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition active:scale-[.98] ${
                  isFrozen
                    ? "border-[#f0d6d6] bg-[#fff6f6] text-[#b54f4f]"
                    : "border-[#e7eaed] text-[#48515a] hover:bg-[#f7f8f9]"
                }`}
              >
                <CardIcon name="freeze" className="h-4 w-4" />
                {isFrozen ? "Unfreeze card" : "Freeze card"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPinStage("enter");
                  setPinValue("");
                  setPinConfirmValue("");
                  setPinModalOpen(true);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e7eaed] px-3 text-xs font-semibold text-[#48515a] transition hover:bg-[#f7f8f9] active:scale-[.98]"
              >
                <CardIcon name="lock" className="h-4 w-4" />
                Set PIN
              </button>
              <button
                type="button"
                onClick={() => setReplaceConfirm(true)}
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
                    {formatNaira(cardBalance)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[.1em] ${
                    isFrozen
                      ? "bg-[#fbe9e7] text-[#b54f4f]"
                      : "bg-[#e8f6ee] text-[#16875a]"
                  }`}
                >
                  {isFrozen ? "Frozen" : "Active"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#8b929a]">
                Use this balance for online payments, subscriptions, and
                contactless transactions.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFundModalOpen(true)}
                  className="h-10 rounded-xl bg-[#075b9d] px-3 text-xs font-semibold text-white transition hover:bg-[#064c82] active:scale-[.98]"
                >
                  Add money
                </button>
                <button
                  type="button"
                  onClick={() => setLimitsModalOpen(true)}
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
                  Control how and where your card can be used.
                </p>
              </div>
              <PreferenceRow
                title="Online payments"
                description="Allow online purchases"
                icon="card"
                checked={onlinePayments}
                onChange={() => togglePreference("onlinePayments")}
              />
              <div className="border-t border-[#eff1f3]">
                <PreferenceRow
                  title="Contactless"
                  description="Tap-to-pay transactions"
                  icon="contactless"
                  checked={contactless}
                  onChange={() => togglePreference("contactless")}
                />
              </div>
              <div className="border-t border-[#eff1f3]">
                <PreferenceRow
                  title="International"
                  description="Payments outside your country"
                  icon="globe"
                  checked={internationalPayments}
                  onChange={() => togglePreference("internationalPayments")}
                />
              </div>
              <div className="border-t border-[#eff1f3]">
                <PreferenceRow
                  title="ATM withdrawals"
                  description="Cash withdrawals at ATMs"
                  icon="lock"
                  checked={atmWithdrawals}
                  onChange={() => togglePreference("atmWithdrawals")}
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Add Money Modal */}
      <ModalShell
        open={fundModalOpen}
        title="Add money to card"
        onClose={() => setFundModalOpen(false)}
      >
        <p className="text-sm leading-6 text-[#6b7280]">
          Fund your Quilox card to start making payments instantly.
        </p>
        <div className="mt-4">
          <label className="text-xs font-semibold text-[#52606b]">
            Amount (₦)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            placeholder="0.00"
            className="mt-2 h-12 w-full rounded-xl border border-[#e4e8eb] px-4 text-lg font-bold text-[#20252b] outline-none transition focus:border-[#075b9d] focus:ring-2 focus:ring-[#075b9d]/15"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {[5000, 10000, 25000, 50000].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setFundAmount(String(quick))}
                className="rounded-full border border-[#e4e8eb] px-3 py-1.5 text-xs font-semibold text-[#52606b] transition hover:bg-[#f7f8f9] active:scale-95"
              >
                ₦{quick.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 rounded-xl bg-[#f7f9fb] p-3 text-xs leading-5 text-[#7a828b]">
          Current balance:{" "}
          <span className="font-semibold text-[#30363d]">
            {formatNaira(cardBalance)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleFundCard}
          className="mt-5 h-11 w-full rounded-xl bg-[#075b9d] text-sm font-semibold text-white transition hover:bg-[#064c82] active:scale-[.98]"
        >
          Add money
        </button>
      </ModalShell>

      {/* Set PIN Modal */}
      <ModalShell
        open={pinModalOpen}
        title={pinStage === "enter" ? "Set card PIN" : "Confirm PIN"}
        onClose={() => {
          setPinModalOpen(false);
          setPinStage("enter");
          setPinValue("");
          setPinConfirmValue("");
        }}
      >
        <p className="text-sm leading-6 text-[#6b7280]">
          {pinStage === "enter"
            ? "Create a 4-digit PIN to secure your card transactions."
            : "Re-enter your 4-digit PIN to confirm."}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          {[0, 1, 2, 3].map((index) => {
            const value =
              pinStage === "enter" ? pinValue[index] : pinConfirmValue[index];
            return (
              <div
                key={index}
                className={`grid h-14 w-12 place-items-center rounded-xl border-2 text-xl font-bold transition ${
                  value
                    ? "border-[#075b9d] bg-[#f0f6fb] text-[#075b9d]"
                    : "border-[#e4e8eb] text-[#30363d]"
                }`}
              >
                {value ? "•" : ""}
              </div>
            );
          })}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => {
                if (pinStage === "enter") {
                  if (pinValue.length < 4) setPinValue(pinValue + digit);
                } else {
                  if (pinConfirmValue.length < 4)
                    setPinConfirmValue(pinConfirmValue + digit);
                }
              }}
              className="h-12 rounded-xl border border-[#e4e8eb] text-lg font-semibold text-[#30363d] transition hover:bg-[#f7f8f9] active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              if (pinStage === "enter") {
                setPinValue((v) => v.slice(0, -1));
              } else {
                setPinConfirmValue((v) => v.slice(0, -1));
              }
            }}
            className="h-12 rounded-xl border border-[#e4e8eb] text-lg font-semibold text-[#52606b] transition hover:bg-[#f7f8f9] active:scale-95"
            aria-label="Backspace"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={() => {
              if (pinStage === "enter") {
                if (pinValue.length < 4) setPinValue(pinValue + "0");
              } else {
                if (pinConfirmValue.length < 4)
                  setPinConfirmValue(pinConfirmValue + "0");
              }
            }}
            className="h-12 rounded-xl border border-[#e4e8eb] text-lg font-semibold text-[#30363d] transition hover:bg-[#f7f8f9] active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleSetPin}
            className="h-12 rounded-xl bg-[#075b9d] text-sm font-semibold text-white transition hover:bg-[#064c82] active:scale-95"
          >
            {pinStage === "enter" ? "Next" : "Save"}
          </button>
        </div>
      </ModalShell>

      {/* Spending Limits Modal */}
      <ModalShell
        open={limitsModalOpen}
        title="Spending limits"
        onClose={() => setLimitsModalOpen(false)}
      >
        <p className="text-sm leading-6 text-[#6b7280]">
          Set daily and monthly spending limits for your card.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#52606b]">
              Daily limit (₦)
            </label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="mt-2 h-12 w-full rounded-xl border border-[#e4e8eb] px-4 text-base font-semibold text-[#20252b] outline-none transition focus:border-[#075b9d] focus:ring-2 focus:ring-[#075b9d]/15"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#52606b]">
              Monthly limit (₦)
            </label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(Number(e.target.value))}
              className="mt-2 h-12 w-full rounded-xl border border-[#e4e8eb] px-4 text-base font-semibold text-[#20252b] outline-none transition focus:border-[#075b9d] focus:ring-2 focus:ring-[#075b9d]/15"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveLimits}
          className="mt-5 h-11 w-full rounded-xl bg-[#075b9d] text-sm font-semibold text-white transition hover:bg-[#064c82] active:scale-[.98]"
        >
          Save limits
        </button>
      </ModalShell>

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
