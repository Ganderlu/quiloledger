export default function DashboardPage() {
  const balances = [
    { label: "Main", amount: "$0.00" },
    { label: "Savings", amount: "$0.00" },
  ];

  const recentActivity = [
    { id: "1", label: "Welcome to QuiloxLedger", meta: "Set up your first wallet flow" },
    { id: "2", label: "Receive funds", meta: "Share your address from the Receive page" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            Wallet overview and recent activity.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {balances.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {item.label}
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">
              {item.amount}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-base font-semibold">Recent activity</h2>
        <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
          {recentActivity.map((item) => (
            <div key={item.id} className="py-4">
              <div className="text-sm font-medium">{item.label}</div>
              <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {item.meta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
