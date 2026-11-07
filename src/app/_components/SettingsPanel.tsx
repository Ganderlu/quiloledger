"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
  type AuthError,
  type User,
} from "firebase/auth";
import {
  getStoredBoolean,
  getStoredCurrency,
  setDarkMode,
  setWalletPreference,
  walletPreferenceKeys,
  walletPreferencesChangedEvent,
  type WalletCurrency,
} from "@/lib/wallet-preferences";

type SettingsPanelProps = {
  user: User;
  mode: "sheet" | "page";
  onSignOut: () => void;
  onClose?: () => void;
  onHideBalanceChange?: (hide: boolean) => void;
};

type FeatureKey =
  | "kyc"
  | "invoice"
  | "wallets"
  | "referral"
  | "email"
  | "password";

function SettingsIcon({ name }: { name: string }) {
  const props = {
    "aria-hidden": true as const,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-[18px] w-[18px]",
  };
  switch (name) {
    case "moon":
      return (
        <svg {...props}>
          <path d="M20.8 14.2A8.8 8.8 0 0 1 9.8 3.2 8.8 8.8 0 1 0 20.8 14.2Z" />
        </svg>
      );
    case "eye":
      return (
        <svg {...props}>
          <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "currency":
      return (
        <svg {...props}>
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <path d="M2.5 9h19m-14 5h.01M12 12v4m2-2h-4" />
        </svg>
      );
    case "kyc":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1a5.5 5.5 0 0 1 11 0v1M16 11l2 2 4-4" />
        </svg>
      );
    case "invoice":
      return (
        <svg {...props}>
          <path d="M6 3h12v18l-2.5-1.5L13 21l-3-1.5L7 21l-1-1V3Z" />
          <path d="M9 8h6m-6 4h6m-6 4h3" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="15" rx="2" />
          <path d="M3 9h18m-5 5h.01" />
        </svg>
      );
    case "referral":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="18" cy="9" r="2" />
          <path d="M3 20v-1a6 6 0 0 1 12 0v1m1-5a4 4 0 0 1 5 4v1" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
        </svg>
      );
    case "support":
      return (
        <svg {...props}>
          <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
          <path d="M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2Zm16 0h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2ZM12 20h3" />
        </svg>
      );
    case "logout":
      return (
        <svg {...props}>
          <path d="M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...props}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "copy":
      return (
        <svg {...props}>
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
        </svg>
      );
    default:
      return null;
  }
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-[#16875a]" : "bg-[#cfd4d8]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all ${
          checked ? "left-[22px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function friendlyAuthError(error: AuthError) {
  switch (error.code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Your current password is incorrect.";
    case "auth/requires-recent-login":
      return "For your security, sign in again and retry this change.";
    case "auth/email-already-in-use":
      return "That email is already associated with another account.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Choose a stronger password with at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "We couldn't update your account. Please try again.";
  }
}

function AccountSecurity({
  user,
  compact = false,
}: {
  user: User;
  compact?: boolean;
}) {
  const [open, setOpen] = useState<"email" | "password" | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function openForm(form: "email" | "password") {
    setOpen((current) => (current === form ? null : form));
    setMessage("");
    setError("");
    setCurrentPassword("");
  }

  async function reauthenticate() {
    if (!user.email) {
      throw new Error("This account does not have an email/password sign-in.");
    }
    await reauthenticateWithCredential(
      user,
      EmailAuthProvider.credential(user.email, currentPassword),
    );
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!newEmail.trim() || newEmail.trim() === user.email) {
      setError("Enter a different email address.");
      return;
    }
    setBusy(true);
    try {
      await reauthenticate();
      await verifyBeforeUpdateEmail(user, newEmail.trim());
      setMessage("Check your new inbox to verify the email change.");
      setNewEmail("");
      setCurrentPassword("");
    } catch (err) {
      setError(
        err instanceof Error && !("code" in err)
          ? err.message
          : friendlyAuthError(err as AuthError),
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (newPassword.length < 6) {
      setError("Choose a password with at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The new passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await reauthenticate();
      await updatePassword(user, newPassword);
      setMessage("Your password has been updated.");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (err) {
      setError(
        err instanceof Error && !("code" in err)
          ? err.message
          : friendlyAuthError(err as AuthError),
      );
    } finally {
      setBusy(false);
    }
  }

  const rowClass = compact
    ? "flex w-full items-center gap-3 py-3.5 text-left"
    : "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#f7f8f9] dark:hover:bg-[#222b31]";

  return (
    <div>
      <div className={compact ? "divide-y divide-[#eceef0]" : "space-y-2"}>
        <button
          type="button"
          onClick={() => openForm("email")}
          className={rowClass}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f5f7] text-[#515d67] dark:bg-[#222b31] dark:text-[#c6d0d6]">
            <SettingsIcon name="mail" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-[#424950] dark:text-[#e1e7ea]">
              Change email address
            </span>
            {!compact ? (
              <span className="mt-1 block truncate text-xs text-[#8b9299] dark:text-[#a6b0b7]">
                {user.email || "No email address on this account"}
              </span>
            ) : null}
          </span>
          <SettingsIcon name="chevron" />
        </button>
        {open === "email" ? (
          <form
            onSubmit={submitEmail}
            className="space-y-3 rounded-xl bg-[#f7f9fa] p-3 dark:bg-[#202930] sm:p-4"
          >
            <p className="text-xs leading-5 text-[#737d85] dark:text-[#b2bdc3]">
              We’ll send a verification link to your new address. Your account
              email changes after you confirm it.
            </p>
            <label className="block text-xs font-medium text-[#59636c]">
              New email
              <input
                type="email"
                autoComplete="email"
                required
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-sm text-[#343b42] outline-none focus:border-[#78a8c4] dark:border-[#3a464e] dark:bg-[#171e23] dark:text-[#e8edef]"
              />
            </label>
            <label className="block text-xs font-medium text-[#59636c]">
              Current password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-sm text-[#343b42] outline-none focus:border-[#78a8c4] dark:border-[#3a464e] dark:bg-[#171e23] dark:text-[#e8edef]"
              />
            </label>
            {error ? (
              <p role="alert" className="text-xs text-[#b6464b]">
                {error}
              </p>
            ) : null}
            {message ? (
              <p role="status" className="text-xs text-[#16875a]">
                {message}
              </p>
            ) : null}
            <button
              disabled={busy}
              className="h-10 rounded-lg bg-[#075b9d] px-4 text-xs font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Sending verification…" : "Send verification email"}
            </button>
          </form>
        ) : null}

        <button
          type="button"
          onClick={() => openForm("password")}
          className={rowClass}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f5f7] text-[#515d67] dark:bg-[#222b31] dark:text-[#c6d0d6]">
            <SettingsIcon name="lock" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-[#424950] dark:text-[#e1e7ea]">
              Change account password
            </span>
            {!compact ? (
              <span className="mt-1 block text-xs text-[#8b9299] dark:text-[#a6b0b7]">
                Update your sign-in password
              </span>
            ) : null}
          </span>
          <SettingsIcon name="chevron" />
        </button>
        {open === "password" ? (
          <form
            onSubmit={submitPassword}
            className="space-y-3 rounded-xl bg-[#f7f9fa] p-3 dark:bg-[#202930] sm:p-4"
          >
            <label className="block text-xs font-medium text-[#59636c]">
              Current password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-sm text-[#343b42] outline-none focus:border-[#78a8c4] dark:border-[#3a464e] dark:bg-[#171e23] dark:text-[#e8edef]"
              />
            </label>
            <label className="block text-xs font-medium text-[#59636c]">
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-sm text-[#343b42] outline-none focus:border-[#78a8c4] dark:border-[#3a464e] dark:bg-[#171e23] dark:text-[#e8edef]"
              />
            </label>
            <label className="block text-xs font-medium text-[#59636c]">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-sm text-[#343b42] outline-none focus:border-[#78a8c4] dark:border-[#3a464e] dark:bg-[#171e23] dark:text-[#e8edef]"
              />
            </label>
            {error ? (
              <p role="alert" className="text-xs text-[#b6464b]">
                {error}
              </p>
            ) : null}
            {message ? (
              <p role="status" className="text-xs text-[#16875a]">
                {message}
              </p>
            ) : null}
            <button
              disabled={busy}
              className="h-10 rounded-lg bg-[#075b9d] px-4 text-xs font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Updating password…" : "Update password"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function SwitchRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex min-h-[54px] items-center gap-3 py-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f5f7] text-[#4e5962] dark:bg-[#222b31] dark:text-[#c6d0d6]">
        <SettingsIcon name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#424950] dark:text-[#e1e7ea]">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-[11px] leading-4 text-[#9199a0] dark:text-[#a6b0b7]">
            {description}
          </span>
        ) : null}
      </span>
      <Toggle checked={checked} label={label} onChange={onChange} />
    </div>
  );
}

function FeatureRows({
  user,
  expanded,
  setExpanded,
  onSignOut,
}: {
  user: User;
  expanded: FeatureKey | null;
  setExpanded: (key: FeatureKey | null) => void;
  onSignOut: () => void;
}) {
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceNote, setInvoiceNote] = useState("");
  const [invoiceResult, setInvoiceResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [featureNotice, setFeatureNotice] = useState("");
  const referralCode = `QLX-${(user.uid.slice(0, 7) || "MEMBER").toUpperCase()}`;

  function toggle(key: FeatureKey) {
    setExpanded(expanded === key ? null : key);
    setFeatureNotice("");
  }

  async function copyReferral() {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setFeatureNotice(`Your referral code is ${referralCode}.`);
    }
  }

  function createInvoicePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(invoiceAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFeatureNotice("Enter an amount greater than zero.");
      return;
    }
    const reference = `QLX-${Date.now().toString().slice(-8)}`;
    const invoice = {
      reference,
      amount,
      note: invoiceNote.trim(),
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("qlx-invoice-preview", JSON.stringify(invoice));
    } catch {}
    setInvoiceResult(reference);
    setFeatureNotice("Invoice preview saved on this device.");
  }

  const rowClass =
    "flex min-h-[52px] w-full items-center gap-3 py-2.5 text-left text-[#424950] transition active:scale-[.99] dark:text-[#e1e7ea]";

  return (
    <div className="divide-y divide-[#eceef0] dark:divide-[#293238]">
      <button type="button" onClick={() => toggle("kyc")} className={rowClass}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f5f7] text-[#4e5962] dark:bg-[#222b31] dark:text-[#c6d0d6]">
          <SettingsIcon name="kyc" />
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium text-[#424950] dark:text-[#e1e7ea]">
          KYC verification
        </span>
        <span className="rounded-md bg-[#fff0ed] px-2 py-1 text-[9px] font-semibold text-[#bc5b50] dark:bg-[#3a2827] dark:text-[#f0aaa1]">
          Not verified
        </span>
      </button>
      {expanded === "kyc" ? (
        <div className="pb-4 pl-12 pr-1">
          <p className="text-xs leading-5 text-[#7e878e] dark:text-[#aeb8be]">
            Identity verification has not been submitted for this account.
            Verification services are not connected yet, so no documents should
            be uploaded here.
          </p>
          <span className="inline-block rounded-md bg-[#f1f3f4] px-2 py-1 text-[10px] font-medium text-[#737d85] dark:bg-[#252e34] dark:text-[#b4bec4]">
            Verification unavailable
          </span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => toggle("invoice")}
        className={rowClass}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f5f7] text-[#4e5962] dark:bg-[#222b31] dark:text-[#c6d0d6]">
          <SettingsIcon name="invoice" />
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium text-[#424950]">
          Invoice
        </span>
        <SettingsIcon name="chevron" />
      </button>
      {expanded === "invoice" ? (
        <form
          onSubmit={createInvoicePreview}
          className="space-y-3 pb-4 pl-12 pr-1"
        >
          <p className="text-xs leading-5 text-[#7e878e]">
            Create a local invoice preview. It won’t be sent to a customer or
            recorded as a payment.
          </p>
          <input
            aria-label="Invoice amount in NGN"
            type="number"
            min="1"
            step="any"
            required
            value={invoiceAmount}
            onChange={(event) => setInvoiceAmount(event.target.value)}
            placeholder="Amount in NGN"
            className="h-10 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-sm outline-none focus:border-[#78a8c4]"
          />
          <input
            aria-label="Invoice note"
            value={invoiceNote}
            onChange={(event) => setInvoiceNote(event.target.value)}
            placeholder="Description (optional)"
            className="h-10 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-sm outline-none focus:border-[#78a8c4]"
          />
          <button className="h-9 rounded-lg bg-[#075b9d] px-3 text-xs font-semibold text-white">
            Create invoice preview
          </button>
          {invoiceResult ? (
            <p className="text-xs font-medium text-[#16875a]">
              Preview reference: {invoiceResult}
            </p>
          ) : null}
          {featureNotice ? (
            <p role="status" className="text-xs text-[#6b7880]">
              {featureNotice}
            </p>
          ) : null}
        </form>
      ) : null}

      <button
        type="button"
        onClick={() => toggle("wallets")}
        className={rowClass}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f5f7] text-[#4e5962] dark:bg-[#222b31] dark:text-[#c6d0d6]">
          <SettingsIcon name="wallet" />
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium text-[#424950]">
          Linked wallets
        </span>
        <span className="text-[10px] text-[#8d969e]">0 linked</span>
      </button>
      {expanded === "wallets" ? (
        <div className="pb-4 pl-12 pr-1">
          <p className="text-xs leading-5 text-[#7e878e]">
            No external wallets are linked. Wallet provider connections are not
            available yet.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => toggle("referral")}
        className={rowClass}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f5f7] text-[#4e5962] dark:bg-[#222b31] dark:text-[#c6d0d6]">
          <SettingsIcon name="referral" />
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium text-[#424950]">
          Referral
        </span>
        <SettingsIcon name="chevron" />
      </button>
      {expanded === "referral" ? (
        <div className="pb-4 pl-12 pr-1">
          <p className="text-xs leading-5 text-[#7e878e]">
            Your personal referral code
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-[#f4f6f7] px-3 py-2.5 text-sm font-semibold tracking-wider text-[#3d464d]">
              {referralCode}
            </code>
            <button
              type="button"
              onClick={copyReferral}
              aria-label="Copy referral code"
              className="grid h-10 w-10 place-items-center rounded-lg border border-[#e1e6e9] bg-white text-[#53616a] hover:bg-[#f6f8f9]"
            >
              <SettingsIcon name="copy" />
            </button>
          </div>
          {copied ? (
            <p role="status" className="mt-2 text-xs text-[#16875a]">
              Referral code copied.
            </p>
          ) : null}
          {featureNotice ? (
            <p role="status" className="mt-2 text-xs text-[#6b7880]">
              {featureNotice}
            </p>
          ) : null}
        </div>
      ) : null}
      <AccountSecurity user={user} compact />
      <Link
        href="/docs"
        className={`${rowClass} text-sm font-medium text-[#424950] dark:text-[#e1e7ea]`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f5f7] text-[#4e5962] dark:bg-[#222b31] dark:text-[#c6d0d6]">
          <SettingsIcon name="support" />
        </span>
        <span className="min-w-0 flex-1">Customer support &amp; help</span>
        <SettingsIcon name="chevron" />
      </Link>
      <button
        type="button"
        onClick={onSignOut}
        className={`${rowClass} text-sm font-medium text-[#b44f4f]`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff2f1] text-[#b44f4f]">
          <SettingsIcon name="logout" />
        </span>
        <span className="flex-1">Log out</span>
        <SettingsIcon name="chevron" />
      </button>
    </div>
  );
}

export function SettingsPanel({
  user,
  mode,
  onSignOut,
  onClose,
  onHideBalanceChange,
}: SettingsPanelProps) {
  const [darkMode, setDarkModeState] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [currency, setCurrency] = useState<WalletCurrency>("NGN");
  const [expanded, setExpanded] = useState<FeatureKey | null>(null);

  useEffect(() => {
    const syncPreferences = () => {
      setDarkModeState(document.documentElement.classList.contains("dark"));
      setHideBalance(getStoredBoolean(walletPreferenceKeys.hideBalance));
      setCurrency(getStoredCurrency());
    };
    syncPreferences();
    window.addEventListener(walletPreferencesChangedEvent, syncPreferences);
    window.addEventListener("storage", syncPreferences);
    return () => {
      window.removeEventListener(
        walletPreferencesChangedEvent,
        syncPreferences,
      );
      window.removeEventListener("storage", syncPreferences);
    };
  }, []);

  function changeHideBalance(next: boolean) {
    setHideBalance(next);
    setWalletPreference(walletPreferenceKeys.hideBalance, String(next));
    onHideBalanceChange?.(next);
  }

  function changeCurrency(next: WalletCurrency) {
    setCurrency(next);
    setWalletPreference(walletPreferenceKeys.currency, next);
  }

  function changeTheme(next: boolean) {
    setDarkModeState(next);
    setDarkMode(next);
  }

  const displayName =
    user.displayName || user.email?.split("@")[0] || "Quilox member";
  const avatar = displayName.slice(0, 1).toUpperCase();

  if (mode === "sheet") {
    return (
      <div className="fixed inset-0 z-[60] sm:hidden">
        <button
          type="button"
          aria-label="Close settings"
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
        />
        <section className="absolute inset-x-0 top-0 bottom-[calc(59px+env(safe-area-inset-bottom))] flex flex-col overflow-hidden bg-[#f6f7f9] text-[#343a40] shadow-2xl dark:bg-[#11171b] dark:text-[#eef2f4]">
          <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#e7e9ec] bg-white px-4 dark:border-[#293238] dark:bg-[#171e23]">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#071720] text-white">
                <SettingsIcon name="wallet" />
              </span>
              <span className="text-base font-bold">Settings</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-full bg-[#f1f3f4] px-4 text-xs font-semibold text-[#56616a] active:scale-95 dark:bg-[#273138] dark:text-[#e0e6e9]"
            >
              Done
            </button>
          </header>
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-5">
            <div className="my-4 flex items-center gap-3 rounded-2xl border border-[#e9ecee] bg-white p-4 dark:border-[#293238] dark:bg-[#171e23]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e8f4ed] text-base font-bold text-[#188453]">
                {avatar}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[#323a41] dark:text-[#f0f3f5]">
                  {displayName}
                </span>
                <span className="mt-1 block truncate text-[11px] uppercase tracking-wide text-[#89929a]">
                  {user.email}
                </span>
              </span>
            </div>

            <section className="rounded-2xl border border-[#e9ecee] bg-white px-4 dark:border-[#293238] dark:bg-[#171e23]">
              <SwitchRow
                icon="moon"
                label="Dark mode"
                checked={darkMode}
                onChange={() => changeTheme(!darkMode)}
              />
              <div className="border-t border-[#eceef0] dark:border-[#293238]">
                <SwitchRow
                  icon="eye"
                  label="Hide balance"
                  checked={hideBalance}
                  onChange={() => changeHideBalance(!hideBalance)}
                />
              </div>
              <div className="flex min-h-[54px] items-center gap-3 border-t border-[#eceef0] py-2 dark:border-[#293238]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f5f7] text-[#4e5962]">
                  <SettingsIcon name="currency" />
                </span>
                <span className="flex-1 text-sm font-medium text-[#424950] dark:text-[#e1e7ea]">
                  Currency
                </span>
                <select
                  aria-label="Preferred currency"
                  value={currency}
                  onChange={(event) =>
                    changeCurrency(event.target.value as WalletCurrency)
                  }
                  className="h-9 rounded-lg bg-transparent px-2 text-sm font-medium text-[#4c555d] outline-none dark:text-[#e2e7ea]"
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="border-t border-[#eceef0] dark:border-[#293238]">
                <FeatureRows
                  user={user}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  onSignOut={onSignOut}
                />
              </div>
            </section>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#e8ecef] bg-white p-5 shadow-[0_8px_24px_rgba(25,36,50,0.035)] sm:p-6 dark:border-[#293238] dark:bg-[#171e23]">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[#e8f4ed] text-lg font-bold text-[#188453]">
          {avatar}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-[#30373e] dark:text-[#f0f3f5]">
            {displayName}
          </h2>
          <p className="mt-1 truncate text-sm text-[#818a92]">{user.email}</p>
        </div>
        <span className="rounded-full bg-[#edf7f1] px-3 py-1.5 text-[10px] font-semibold text-[#238153]">
          Account active
        </span>
      </section>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="hidden rounded-2xl border border-[#e8ecef] bg-white p-2 lg:block dark:border-[#293238] dark:bg-[#171e23]"
        >
          {[
            ["Preferences", "#preferences"],
            ["Account security", "#security"],
            ["Wallet services", "#services"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#59636c] transition hover:bg-[#f3f6f7] hover:text-[#075b9d] dark:text-[#b9c2c7] dark:hover:bg-[#222b31]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="space-y-5">
          <section
            id="preferences"
            className="scroll-mt-24 rounded-2xl border border-[#e8ecef] bg-white p-4 shadow-[0_8px_24px_rgba(25,36,50,0.025)] sm:p-6 dark:border-[#293238] dark:bg-[#171e23]"
          >
            <div className="border-b border-[#edf0f2] pb-4 dark:border-[#293238]">
              <h2 className="text-sm font-bold text-[#30373e] dark:text-[#f0f3f5]">
                Preferences
              </h2>
              <p className="mt-1 text-xs text-[#8b939a]">
                Personalize how QuiloxLedger looks and displays balances.
              </p>
            </div>
            <div className="divide-y divide-[#edf0f2] dark:divide-[#293238]">
              <SwitchRow
                icon="moon"
                label="Dark mode"
                description="Use a darker appearance across the app"
                checked={darkMode}
                onChange={() => changeTheme(!darkMode)}
              />
              <SwitchRow
                icon="eye"
                label="Hide balances"
                description="Mask wallet amounts on your dashboard"
                checked={hideBalance}
                onChange={() => changeHideBalance(!hideBalance)}
              />
              <div className="flex flex-wrap items-center gap-3 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2f5f7] text-[#4e5962]">
                  <SettingsIcon name="currency" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#424950] dark:text-[#e1e7ea]">
                    Display currency
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#9199a0]">
                    Used for wallet balance display
                  </span>
                </span>
                <select
                  aria-label="Preferred currency"
                  value={currency}
                  onChange={(event) =>
                    changeCurrency(event.target.value as WalletCurrency)
                  }
                  className="h-10 rounded-lg border border-[#e3e7ea] bg-white px-3 text-sm font-semibold text-[#46515a] outline-none focus:border-[#78a8c4] dark:border-[#364149] dark:bg-[#202930] dark:text-[#e7ecef]"
                >
                  <option value="NGN">NGN · Naira</option>
                  <option value="USD">USD · US Dollar</option>
                  <option value="EUR">EUR · Euro</option>
                </select>
              </div>
            </div>
          </section>

          <section
            id="security"
            className="scroll-mt-24 rounded-2xl border border-[#e8ecef] bg-white p-4 shadow-[0_8px_24px_rgba(25,36,50,0.025)] sm:p-6 dark:border-[#293238] dark:bg-[#171e23]"
          >
            <div className="border-b border-[#edf0f2] pb-4 dark:border-[#293238]">
              <h2 className="text-sm font-bold text-[#30373e] dark:text-[#f0f3f5]">
                Account security
              </h2>
              <p className="mt-1 text-xs text-[#8b939a]">
                Change credentials with a fresh password confirmation.
              </p>
            </div>
            <div className="pt-2">
              <AccountSecurity user={user} />
            </div>
          </section>

          <section
            id="services"
            className="scroll-mt-24 rounded-2xl border border-[#e8ecef] bg-white p-4 shadow-[0_8px_24px_rgba(25,36,50,0.025)] sm:p-6 dark:border-[#293238] dark:bg-[#171e23]"
          >
            <div className="border-b border-[#edf0f2] pb-4 dark:border-[#293238]">
              <h2 className="text-sm font-bold text-[#30373e] dark:text-[#f0f3f5]">
                Wallet services
              </h2>
              <p className="mt-1 text-xs text-[#8b939a]">
                Manage verification, invoices, wallet links, and referrals.
              </p>
            </div>
            <div className="pt-2">
              <FeatureRows
                user={user}
                expanded={expanded}
                setExpanded={setExpanded}
                onSignOut={onSignOut}
              />
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8ecef] bg-white p-4 dark:border-[#293238] dark:bg-[#171e23]">
            <div>
              <p className="text-sm font-semibold text-[#404850] dark:text-[#e8edef]">
                Need a hand?
              </p>
              <p className="mt-1 text-xs text-[#8b939a]">
                Visit help and product documentation.
              </p>
            </div>
            <Link
              href="/docs"
              className="inline-flex h-9 items-center rounded-lg border border-[#e3e7ea] px-3 text-xs font-semibold text-[#46515a] hover:bg-[#f7f8f9] dark:border-[#364149] dark:text-[#d8e0e4] dark:hover:bg-[#202930]"
            >
              Help center
            </Link>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onSignOut}
              className="h-10 rounded-lg px-3 text-xs font-semibold text-[#b44f4f] hover:bg-[#fff1ef]"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function MobileSettingsSheet({ onClose, ...props }: SettingsPanelProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return <SettingsPanel {...props} onClose={onClose} mode="sheet" />;
}
