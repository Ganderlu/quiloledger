"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  type AuthError,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

function friendlyError(error: AuthError): string {
  switch (error.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Incorrect email or password. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/invalid-action-code":
      return "This password reset link has expired. Request a new one.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "We couldn't sign you in. Please try again.";
  }
}

function LoginIcon({ name }: { name: "mail" | "lock" | "eye" | "eyeOff" }) {
  const props = {
    "aria-hidden": true as const,
    viewBox: "0 0 24 24",
    className: "h-[19px] w-[19px]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
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
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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
          <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.2 0 9.5 7 9.5 7a15 15 0 0 1-2.2 3.1M6.2 6.2C3.8 7.8 2.5 12 2.5 12s3.3 7 9.5 7a10 10 0 0 0 3-.5" />
        </svg>
      );
  }
}

function LoginBrand() {
  return (
    <div
      aria-label="QuiloxLedger"
      className="relative grid h-14 w-14 place-items-center text-[#18c9c2] sm:h-[76px] sm:w-[76px]"
    >
      <span className="absolute left-0 top-[10px] h-3 w-3 rounded-full bg-current" />
      <span className="absolute bottom-1 left-0 h-3 w-3 rounded-full bg-current" />
      <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-current" />
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="h-12 w-12 sm:h-[62px] sm:w-[62px]"
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      setError(friendlyError(err as AuthError));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordRecovery() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError(
        "Enter your email address above and we’ll send you a reset link.",
      );
      document.getElementById("email")?.focus();
      return;
    }

    setSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice(
        "If an account matches that email, a password reset link is on its way.",
      );
    } catch (err) {
      const authError = err as AuthError;
      setError(
        authError.code === "auth/invalid-email"
          ? "Please enter a valid email address."
          : authError.code === "auth/too-many-requests"
            ? "Too many requests. Please wait a moment and try again."
            : "We couldn't send a reset link right now. Please try again.",
      );
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-[100svh] flex-1 flex-col items-center overflow-hidden bg-[#05070d] px-4 pb-6 pt-8 text-white sm:justify-center sm:py-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[url('/night-view.jpg')] bg-cover bg-[center_58%] opacity-65"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,5,12,.82)_0%,rgba(3,7,18,.68)_45%,rgba(3,5,12,.78)_100%)]"
      />

      <Link
        href="/"
        aria-label="QuiloxLedger home"
        className="mb-5 shrink-0 transition hover:scale-[1.03] active:scale-95 sm:mb-10"
      >
        <LoginBrand />
      </Link>

      <section className="w-full max-w-[750px] rounded-2xl border border-white/[.09] bg-[#050609]/95 px-4 pb-6 pt-5 shadow-[0_28px_100px_rgba(0,0,0,.55)] backdrop-blur-xl sm:px-8 sm:pb-10 sm:pt-8 md:px-[30px] md:pb-[60px]">
        <p className="text-center text-[15px] leading-6 text-slate-200 sm:text-base">
          Don’t have a wallet?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-400 underline-offset-4 transition hover:text-blue-300 hover:underline"
          >
            Create a wallet
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-5 sm:mt-10">
          <div className="flex h-16 items-center gap-4 border-b border-white/50 px-3 transition-colors focus-within:border-blue-400 sm:h-24 sm:gap-5 sm:px-7">
            <LoginIcon name="mail" />
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-full min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-200/90 focus:ring-0 sm:text-lg"
            />
          </div>

          <div className="flex h-16 items-center gap-4 border-b border-white/50 px-3 transition-colors focus-within:border-blue-400 sm:h-24 sm:gap-5 sm:px-7">
            <LoginIcon name="lock" />
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-full min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-200/90 focus:ring-0 sm:text-lg"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-200 transition hover:bg-white/10 hover:text-white active:scale-95"
            >
              <LoginIcon name={showPassword ? "eyeOff" : "eye"} />
            </button>
          </div>

          <div className="mt-4 flex min-h-5 justify-center sm:mt-5">
            <button
              type="button"
              onClick={handlePasswordRecovery}
              disabled={sendingReset}
              className="inline-flex items-center gap-2 border-b border-blue-400/80 pb-1 text-sm font-medium text-blue-400 transition hover:border-blue-300 hover:text-blue-300 disabled:opacity-60"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 11a9 9 0 1 1 2.6 6.4M3 4v7h7" />
              </svg>
              {sendingReset ? "Sending reset link…" : "Password Recovery"}
            </button>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-200"
            >
              {error}
            </p>
          ) : null}
          {notice ? (
            <p
              role="status"
              className="mt-5 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm leading-5 text-emerald-200"
            >
              {notice}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="group mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#345bd8] to-[#1689e9] px-6 text-base font-bold tracking-wide text-white shadow-[0_10px_30px_rgba(32,111,224,.2)] transition hover:brightness-110 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-65 sm:mt-11 sm:h-[74px] sm:text-lg"
          >
            {loading ? "SIGNING IN…" : "LOGIN"}
            {!loading ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            ) : null}
          </button>
        </form>
      </section>

      <p className="mt-4 text-center text-xs text-white/50 sm:mt-6">
        Secure access to your QuiloxLedger account
      </p>
    </div>
  );
}
