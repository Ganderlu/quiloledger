"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  MobileWalletNav,
  WalletPageHeader,
} from "../_components/WalletNavigation";
import { SettingsPanel } from "../_components/SettingsPanel";

export default function SettingsPage() {
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
        <p className="text-sm text-[#7b858d]">Loading your settings…</p>
      </div>
    );
  }

  return (
    <div className="qlx-wallet-app min-h-screen flex-1 bg-[#f7f8fa] text-[#25282d] dark:bg-[#101619] dark:text-[#e9eef0]">
      <div className="h-1 w-full bg-[#27c84a]" />
      <WalletPageHeader active="" />
      <main className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-9 lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#16875a]">
            Account
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#20252b] sm:text-[30px] dark:text-[#f1f4f5]">
            Settings
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#77808a]">
            Manage your preferences, sign-in details, and wallet services.
          </p>
        </div>
        <SettingsPanel user={user} mode="page" onSignOut={handleSignOut} />
      </main>
      <MobileWalletNav active="" />
    </div>
  );
}
