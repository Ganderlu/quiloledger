import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { MobileMenu } from "./_components/MobileMenu";
import { ThemeToggle } from "./_components/ThemeToggle";
import { cookies } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuiloxLedger",
  description: "QuiloxLedger online wallet",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = (await cookies()).get("qlx-theme")?.value;
  const isDark = theme === "dark";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${isDark ? " dark" : ""}`}
      style={{ colorScheme: isDark ? "dark" : "light" }}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-950 dark:bg-black dark:text-zinc-50">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4">
            <Link href="/" className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 via-blue-600 to-indigo-600 text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path
                    d="M12 2L20 6V12C20 17 16.4 20.8 12 22C7.6 20.8 4 17 4 12V6L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="text-lg font-semibold tracking-tight text-blue-700 dark:text-white">
                QuiloxLedger
              </span>
            </Link>

            <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-zinc-700 dark:text-zinc-300 md:flex">
              <a
                href="#markets"
                className="hover:text-zinc-950 dark:hover:text-white"
              >
                Markets
              </a>
              <Link
                href="#wallet"
                className="hover:text-zinc-950 dark:hover:text-white"
              >
                Wallet
              </Link>
              <a
                href="#features"
                className="hover:text-zinc-950 dark:hover:text-white"
              >
                Features
              </a>
              <a
                href="#build"
                className="hover:text-zinc-950 dark:hover:text-white"
              >
                Build
              </a>
              <a
                href="#support"
                className="hover:text-zinc-950 dark:hover:text-white"
              >
                Support
              </a>
              <a
                href="#about"
                className="hover:text-zinc-950 dark:hover:text-white"
              >
                About
              </a>
            </nav>

            <div className="ml-auto flex items-center gap-3">
              <ThemeToggle />
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-blue-500 px-4 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-white/10"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path
                    d="M12 2C7 2 3 6 3 11C3 16 7 20 12 20C17 20 21 16 21 11C21 6 17 2 12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M3 11H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 2C14.5 4.6 16 7.7 16 11C16 14.3 14.5 17.4 12 20C9.5 17.4 8 14.3 8 11C8 7.7 9.5 4.6 12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <span className="hidden sm:inline">Language</span>
              </button>
              <Link
                href="/login"
                className="hidden h-10 items-center justify-center rounded-full border border-zinc-200 px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-white/10 sm:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hidden h-10 items-center justify-center rounded-full bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:inline-flex"
              >
                Register
              </Link>
              <MobileMenu />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
