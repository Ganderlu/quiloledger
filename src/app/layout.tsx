import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "./_components/SiteHeader";
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
  // Dark is the default appearance for the whole product; light is opt-in.
  const isDark = theme !== "light";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${isDark ? " dark" : ""}`}
      style={{ colorScheme: isDark ? "dark" : "light" }}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-950 dark:bg-black dark:text-zinc-50">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
