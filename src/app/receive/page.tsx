"use client";

import { useCallback, useMemo, useState } from "react";

export default function ReceivePage() {
  const address = useMemo(() => "qlx_9f2c1a8d7b4e3f6a", []);
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const copyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("failed");
      window.setTimeout(() => setStatus("idle"), 2000);
    }
  }, [address]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Receive</h1>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
        Share this address to receive funds into your QuiloxLedger wallet.
      </p>

      <div className="mt-8 max-w-xl rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-medium">Your address</div>
        <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-950 dark:border-zinc-800 dark:bg-black dark:text-zinc-50">
          {address}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={copyAddress}
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Copy address
          </button>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            {status === "copied" ? "Copied to clipboard." : null}
            {status === "failed" ? "Copy failed. Please copy manually." : null}
            {status === "idle" ? "Keep this private." : null}
          </div>
        </div>
      </div>
    </div>
  );
}
