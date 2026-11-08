"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  type AuthError,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const countries = [
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "ZA", name: "South Africa", currency: "ZAR" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "AE", name: "United Arab Emirates", currency: "AED" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "ES", name: "Spain", currency: "EUR" },
] as const;

const currencies = [
  { code: "NGN", name: "Nigerian Naira" },
  { code: "USD", name: "US Dollar" },
  { code: "GBP", name: "British Pound" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "ZAR", name: "South African Rand" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "INR", name: "Indian Rupee" },
  { code: "AED", name: "UAE Dirham" },
  { code: "EUR", name: "Euro" },
] as const;

function friendlyError(error: AuthError): string {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "That email is already registered. Try signing in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Your password is too weak. Use at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "We couldn't create your account. Please try again.";
  }
}

function RegisterIcon({
  name,
}: {
  name: "mail" | "country" | "lock" | "eye" | "eyeOff" | "referral";
}) {
  const props = {
    "aria-hidden": true as const,
    viewBox: "0 0 24 24",
    className: "h-[18px] w-[18px]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "mail":
      return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
    case "country":
      return <svg {...props}><path d="M5 21V4m0 0c5-3 9 3 14 0v10c-5 3-9-3-14 0" /></svg>;
    case "lock":
      return <svg {...props}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
    case "eye":
      return <svg {...props}><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
    case "eyeOff":
      return <svg {...props}><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.2 0 9.5 7 9.5 7a15 15 0 0 1-2.2 3.1M6.2 6.2C3.8 7.8 2.5 12 2.5 12s3.3 7 9.5 7a10 10 0 0 0 3-.5" /></svg>;
    case "referral":
      return <svg {...props}><path d="M4 5h16v14H4z" /><path d="m5 7 7 5 7-5" /></svg>;
  }
}

function RegisterBrand() {
  return (
    <div
      aria-label="QuiloxLedger"
      className="relative grid h-14 w-14 place-items-center text-[#18c9c2] sm:h-[62px] sm:w-[62px]"
    >
      <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-current" />
      <span className="absolute bottom-1 left-0 h-2.5 w-2.5 rounded-full bg-current" />
      <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-current" />
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="h-12 w-12 sm:h-[52px] sm:w-[52px]"
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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [currency, setCurrency] = useState("");
  const [referralId, setReferralId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!countryCode || !currency) {
      setError("Select your country and preferred currency to continue.");
      return;
    }
    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Your passwords don't match. Check and try again.");
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const user = credential.user;
      const profileName = email.trim().split("@")[0] || "Quilox member";

      await updateProfile(user, { displayName: profileName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: profileName,
        email: user.email,
        countryCode,
        country: countries.find((country) => country.code === countryCode)?.name,
        currency,
        ...(referralId.trim()
          ? { referralId: referralId.trim() }
          : {}),
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (err) {
      setError(friendlyError(err as AuthError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-[100svh] flex-1 flex-col items-center overflow-hidden bg-[#05070d] px-4 pb-6 pt-6 text-white sm:justify-center sm:py-8">
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
        className="mb-4 shrink-0 transition hover:scale-[1.03] active:scale-95 sm:mb-5"
      >
        <RegisterBrand />
      </Link>

      <section className="w-full max-w-[565px] rounded-xl border border-white/[.1] bg-[#050609]/95 px-4 pb-6 pt-5 shadow-[0_28px_100px_rgba(0,0,0,.55)] backdrop-blur-xl sm:px-6 sm:pb-8 sm:pt-6 md:px-6">
        <h1 className="sr-only">Create your QuiloxLedger wallet</h1>
        <p className="text-center text-xs leading-5 text-slate-200 sm:text-sm">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-400 underline-offset-4 transition hover:text-blue-300 hover:underline"
          >
            Log In
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-4 sm:mt-5">
          <div className="flex h-[58px] items-center gap-3 border-b border-white/50 px-3 transition-colors focus-within:border-blue-400 sm:h-[66px] sm:gap-4 sm:px-5">
            <RegisterIcon name="mail" />
            <label htmlFor="email" className="sr-only">Email</label>
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
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-200/90 focus:ring-0 sm:text-base"
            />
          </div>

          <div className="flex h-[62px] items-center gap-3 border-b border-white/50 px-3 transition-colors focus-within:border-blue-400 sm:h-[74px] sm:gap-4 sm:px-5">
            <RegisterIcon name="country" />
            <label htmlFor="country" className="sr-only">Country</label>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] leading-4 text-slate-300/75">Country</span>
              <select
                id="country"
                name="country"
                autoComplete="country-name"
                value={countryCode}
                onChange={(event) => {
                  const nextCountry = countries.find(
                    (country) => country.code === event.target.value,
                  );
                  setCountryCode(event.target.value);
                  if (nextCountry) setCurrency(nextCountry.currency);
                }}
                required
                className="h-7 w-full appearance-none bg-transparent text-sm text-white outline-none focus:ring-0"
              >
                <option value="" disabled className="bg-[#11151b] text-slate-400">Select A Country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code} className="bg-[#11151b]">
                    {country.name}
                  </option>
                ))}
              </select>
            </span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          <div className="flex h-[62px] items-center gap-3 border-b border-white/50 px-3 transition-colors focus-within:border-blue-400 sm:h-[74px] sm:gap-4 sm:px-5">
            <RegisterIcon name="country" />
            <label htmlFor="currency" className="sr-only">Currency</label>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] leading-4 text-slate-300/75">Currency</span>
              <select
                id="currency"
                name="currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                required
                className="h-7 w-full appearance-none bg-transparent text-sm text-white outline-none focus:ring-0"
              >
                <option value="" disabled className="bg-[#11151b] text-slate-400">Select A Currency</option>
                {currencies.map((item) => (
                  <option key={item.code} value={item.code} className="bg-[#11151b]">
                    {item.code} · {item.name}
                  </option>
                ))}
              </select>
            </span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          <div className="flex h-[58px] items-center gap-3 border-b border-white/50 px-3 transition-colors focus-within:border-blue-400 sm:h-[66px] sm:gap-4 sm:px-5">
            <RegisterIcon name="referral" />
            <label htmlFor="referral" className="sr-only">Referral ID, optional</label>
            <input
              id="referral"
              name="referral"
              type="text"
              autoComplete="off"
              placeholder="Referral ID (optional)"
              value={referralId}
              onChange={(event) => setReferralId(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-200/90 focus:ring-0 sm:text-base"
            />
          </div>

          <div className="flex h-[58px] items-center gap-3 border-b border-white/50 px-3 transition-colors focus-within:border-blue-400 sm:h-[66px] sm:gap-4 sm:px-5">
            <RegisterIcon name="lock" />
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-200/90 focus:ring-0 sm:text-base"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-200 transition hover:bg-white/10 active:scale-95"
            >
              <RegisterIcon name={showPassword ? "eyeOff" : "eye"} />
            </button>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-2 rounded-md border border-red-400/20 bg-black/30 px-3 py-2 text-[11px] leading-4 text-red-400"
            >
              <span className="mr-2">×</span>{error}
            </p>
          ) : null}

          <div className="flex h-[58px] items-center gap-3 border-b border-white/50 px-3 transition-colors focus-within:border-blue-400 sm:h-[66px] sm:gap-4 sm:px-5">
            <RegisterIcon name="lock" />
            <label htmlFor="confirmPassword" className="sr-only">Retype password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Retype Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-200/90 focus:ring-0 sm:text-base"
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide retyped password" : "Show retyped password"}
              aria-pressed={showConfirmPassword}
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-200 transition hover:bg-white/10 active:scale-95"
            >
              <RegisterIcon name={showConfirmPassword ? "eyeOff" : "eye"} />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#345bd8] to-[#1689e9] px-6 text-sm font-bold tracking-wide text-white shadow-[0_10px_30px_rgba(32,111,224,.2)] transition hover:brightness-110 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-65 sm:mt-7 sm:h-[58px] sm:text-base"
          >
            {loading ? "CREATING WALLET…" : "CREATE WALLET"}
            {!loading ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            ) : null}
          </button>
        </form>
      </section>

      <p className="mt-4 text-center text-[10px] leading-5 text-white/45">
        Your account details are protected and saved securely.
      </p>
    </div>
  );
}
