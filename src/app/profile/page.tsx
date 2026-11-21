"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  MobileWalletNav,
  WalletPageHeader,
} from "../_components/WalletNavigation";
import { SettingsPanel } from "../_components/SettingsPanel";

function ProfileIcon({
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
    case "back":
      return (
        <svg {...props}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4m8-4v4" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="15" rx="2" />
          <path d="M3 9h18m-5 5h.01" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

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

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/login");
  }

  if (checking || !user) {
    return (
      <div className="grid min-h-[70vh] flex-1 place-items-center bg-[#f7f8fa] px-4">
        <p className="text-sm text-[#7b858d]">Loading your profile…</p>
      </div>
    );
  }

  const displayName =
    user.displayName || user.email?.split("@")[0] || "Quilox member";
  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="qlx-wallet-app min-h-screen flex-1 overflow-x-hidden bg-[#f7f8fa] text-[#25282d] dark:bg-[#101619] dark:text-[#e9eef0]">
      <WalletPageHeader active="" />

      <main className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-9 lg:px-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b7280] transition hover:text-[#30363d]"
        >
          <ProfileIcon name="back" className="h-4 w-4" />
          Back
        </button>

        {/* Profile card */}
        <section className="relative overflow-hidden rounded-2xl border border-[#e9ecef] bg-white p-6 shadow-[0_8px_24px_rgba(25,36,50,0.04)] sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#075b9d]/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-[#16875a]/10" />
          <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="relative">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#075b9d] to-[#16875a] text-3xl font-bold text-white shadow-lg sm:h-24 sm:w-24">
                {initial}
              </div>
              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-white bg-[#27c84a]" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-[#20252b] sm:text-[28px]">
                {displayName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-sm text-[#6b7280] sm:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <ProfileIcon name="mail" className="h-4 w-4" />
                  {user.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ProfileIcon name="calendar" className="h-4 w-4" />
                  Member since {memberSince}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f6ee] px-3 py-1 text-xs font-semibold text-[#16875a]">
                  <ProfileIcon name="shield" className="h-3.5 w-3.5" />
                  Verified account
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5fb] px-3 py-1 text-xs font-semibold text-[#075b9d]">
                  <ProfileIcon name="wallet" className="h-3.5 w-3.5" />
                  Wallet active
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto">
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#075b9d] px-5 text-sm font-semibold text-white transition hover:bg-[#064c82] active:scale-[.98]"
              >
                Go to wallet
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#e4e8eb] px-5 text-sm font-semibold text-[#46505a] transition hover:bg-[#f7f8f9] active:scale-[.98]"
              >
                Sign out
              </button>
            </div>
          </div>
        </section>

        {/* Settings */}
        <div className="mt-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#16875a]">
                Account
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#20252b] sm:text-2xl">
                Settings
              </h2>
              <p className="mt-1 text-sm text-[#77808a]">
                Manage your preferences, security, and wallet services.
              </p>
            </div>
          </div>
          <SettingsPanel user={user} mode="page" onSignOut={handleSignOut} />
        </div>
      </main>

      <MobileWalletNav active="" />
    </div>
  );
}
