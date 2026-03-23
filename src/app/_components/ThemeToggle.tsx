"use client";

const THEME_KEY = "qlx-theme";

function getIsDarkFromDom() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function setTheme(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = isDark ? "dark" : "light";
  document.cookie = `${THEME_KEY}=${isDark ? "dark" : "light"}; Path=/; Max-Age=31536000; SameSite=Lax`;
  try {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  } catch {}
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => {
        const next = !getIsDarkFromDom();
        setTheme(next);
      }}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 px-3 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-white/10"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 dark:hidden"
      >
        <path
          d="M21 14.1C20.2 14.4 19.3 14.6 18.4 14.6C14.5 14.6 11.4 11.5 11.4 7.6C11.4 6.7 11.6 5.8 11.9 5C8.6 5.9 6.2 8.9 6.2 12.5C6.2 16.8 9.7 20.3 14 20.3C17.6 20.3 20.6 17.9 21.5 14.6C21.3 14.5 21.2 14.3 21 14.1Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden h-5 w-5 dark:block"
      >
        <path d="M12 3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M19 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      <span className="hidden text-sm font-medium md:inline dark:hidden">Dark mode</span>
      <span className="hidden text-sm font-medium md:hidden dark:md:inline">Light mode</span>
    </button>
  );
}
