export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          QuiloxLedger Developer Docs
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          Everything you need to integrate QuiloxLedger into your product: wallet
          connection, send/receive flows, and platform guidelines.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-black">
            <div className="text-sm font-semibold">Quickstart</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Get up and running with a basic wallet connection.
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-black">
            <div className="text-sm font-semibold">API reference</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Endpoints, request/response shapes, and errors.
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-black">
            <div className="text-sm font-semibold">Security</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Best practices for keys, sessions, and transaction safety.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
