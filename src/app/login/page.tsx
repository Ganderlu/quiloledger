export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        Sign in to your QuiloxLedger wallet.
      </p>

      <form className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:focus:ring-zinc-300"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:focus:ring-zinc-300"
          />
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-blue-700 px-6 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Login (placeholder)
        </button>
      </form>
    </div>
  );
}
