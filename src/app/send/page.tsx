"use client";

import { useMemo, useState } from "react";
import {
  MobileWalletNav,
  WalletPageHeader,
} from "../_components/WalletNavigation";

export default function SendPage() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const errors = useMemo(() => {
    const next: string[] = [];
    if (!recipient.trim()) next.push("Recipient is required.");
    const numericAmount = Number(amount);
    if (!amount.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
      next.push("Amount must be a positive number.");
    }
    return next;
  }, [amount, recipient]);

  return (
    <>
      <WalletPageHeader active="Send" />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 pb-28 sm:pb-10">
      <h1 className="text-2xl font-semibold tracking-tight">Send</h1>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
        Enter a recipient and an amount to prepare a transfer.
      </p>

      <div className="mt-8 max-w-xl rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="block text-sm font-medium" htmlFor="recipient">
          Recipient
        </label>
        <input
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="wallet address or username"
          className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:focus:ring-zinc-300"
        />

        <label className="mt-5 block text-sm font-medium" htmlFor="amount">
          Amount
        </label>
        <input
          id="amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:focus:ring-zinc-300"
        />

        {errors.length > 0 ? (
          <ul className="mt-4 list-disc pl-5 text-sm text-red-600 dark:text-red-400">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
            Ready to send.
          </div>
        )}

        <button
          type="button"
          disabled={errors.length > 0}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Send (placeholder)
        </button>
      </div>
      </div>
      <MobileWalletNav active="Send" />
    </>
  );
}
