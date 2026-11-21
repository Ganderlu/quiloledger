"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type AdminSection = "overview" | "users" | "inbox";

interface AdminUser {
  uid: string;
  fullName: string;
  email: string;
  country: string;
  countryCode: string;
  currency: string;
  emailVerified: boolean;
  disabled: boolean | null;
  createdAt: string | null;
}

interface AdminMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: "open" | "resolved";
  createdAt: string | null;
}

interface OverviewData {
  metrics: {
    totalUsers: number;
    totalMessages: number;
  };
  recentUsers: Pick<
    AdminUser,
    "uid" | "fullName" | "email" | "country" | "createdAt"
  >[];
  recentMessages: AdminMessage[];
  generatedAt: string;
}

interface PageData {
  nextCursor: string | null;
  users?: AdminUser[];
  messages?: AdminMessage[];
}

class AdminRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminRequestError";
    this.status = status;
  }
}

async function adminRequest<T>(
  user: User,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await user.getIdToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  });
  const result = (await response.json().catch(() => ({}))) as {
    error?: string;
  };
  if (!response.ok) {
    throw new AdminRequestError(
      result.error ?? "The request could not be completed.",
      response.status,
    );
  }
  return result as T;
}

function AdminIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const shared = {
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
    case "grid":
      return (
        <svg {...shared}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "users":
      return (
        <svg {...shared}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...shared}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 13h4l2 3h6l2-3h4" />
        </svg>
      );
    case "search":
      return (
        <svg {...shared}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...shared}>
          <path d="M20 7v5h-5M4 17v-5h5" />
          <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...shared}>
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "check":
      return (
        <svg {...shared}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "logout":
      return (
        <svg {...shared}>
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
        </svg>
      );
    case "close":
      return (
        <svg {...shared}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case "menu":
      return (
        <svg {...shared}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "lock":
      return (
        <svg {...shared}>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    default:
      return null;
  }
}

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const sections: {
  id: AdminSection;
  label: string;
  icon: string;
}[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "users", label: "Users", icon: "users" },
  { id: "inbox", label: "Contact inbox", icon: "inbox" },
];

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [usersCursor, setUsersCursor] = useState<string | null>(null);
  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [messagesError, setMessagesError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [messageFilter, setMessageFilter] = useState<
    "all" | "open" | "resolved"
  >("all");
  const [updatingId, setUpdatingId] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadOverview = useCallback(async (user: User) => {
    setLoading(true);
    setError("");
    setErrorStatus(null);
    try {
      const data = await adminRequest<OverviewData>(
        user,
        "/api/admin/overview",
      );
      setOverview(data);
    } catch (caught) {
      const requestError =
        caught instanceof AdminRequestError
          ? caught
          : new AdminRequestError(
              "We couldn’t connect to the admin service.",
              500,
            );
      setError(requestError.message);
      setErrorStatus(requestError.status);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(
    async (reset = false) => {
      if (!currentUser || (loading && !reset)) return;
      setLoading(true);
      setError("");
      setErrorStatus(null);
      setUsersError("");
      try {
        const cursor = reset ? null : usersCursor;
        const suffix = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
        const data = await adminRequest<PageData>(
          currentUser,
          `/api/admin/users${suffix}`,
        );
        setUsers((existing) =>
          reset ? (data.users ?? []) : [...existing, ...(data.users ?? [])],
        );
        setUsersCursor(data.nextCursor);
        setUsersLoaded(true);
      } catch (caught) {
        setUsersLoaded(true);
        setUsersError(
          caught instanceof Error
            ? caught.message
            : "We couldn’t load the user directory.",
        );
        setError(
          caught instanceof Error
            ? caught.message
            : "We couldn’t load the user directory.",
        );
        setErrorStatus(
          caught instanceof AdminRequestError ? caught.status : 500,
        );
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loading, usersCursor],
  );

  const loadMessages = useCallback(
    async (reset = false) => {
      if (!currentUser || (loading && !reset)) return;
      setLoading(true);
      setError("");
      setErrorStatus(null);
      setMessagesError("");
      try {
        const cursor = reset ? null : messagesCursor;
        const suffix = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
        const data = await adminRequest<PageData>(
          currentUser,
          `/api/admin/messages${suffix}`,
        );
        setMessages((existing) =>
          reset
            ? (data.messages ?? [])
            : [...existing, ...(data.messages ?? [])],
        );
        setMessagesCursor(data.nextCursor);
        setMessagesLoaded(true);
      } catch (caught) {
        setMessagesLoaded(true);
        setMessagesError(
          caught instanceof Error
            ? caught.message
            : "We couldn’t load the contact inbox.",
        );
        setError(
          caught instanceof Error
            ? caught.message
            : "We couldn’t load the contact inbox.",
        );
        setErrorStatus(
          caught instanceof AdminRequestError ? caught.status : 500,
        );
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loading, messagesCursor],
  );

  useEffect(() => {
    if (!currentUser) return;
    void loadOverview(currentUser);
    // The overview is loaded when the authenticated admin session changes.
  }, [currentUser, loadOverview]);

  useEffect(() => {
    if (activeSection === "users" && !usersLoaded && currentUser && !loading) {
      void loadUsers(true);
    } else if (
      activeSection === "inbox" &&
      !messagesLoaded &&
      currentUser &&
      !loading
    ) {
      void loadMessages(true);
    }
    // Load each database-backed section the first time it is opened.
  }, [
    activeSection,
    currentUser,
    loading,
    usersLoaded,
    messagesLoaded,
    loadUsers,
    loadMessages,
  ]);

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) =>
      [user.fullName, user.email, user.country, user.uid]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [search, users]);

  const filteredMessages = useMemo(
    () =>
      messages.filter((message) => {
        const matchesStatus =
          messageFilter === "all" || message.status === messageFilter;
        const normalized = search.trim().toLowerCase();
        const matchesSearch =
          !normalized ||
          [message.name, message.email, message.topic, message.message]
            .join(" ")
            .toLowerCase()
            .includes(normalized);
        return matchesStatus && matchesSearch;
      }),
    [messageFilter, messages, search],
  );

  async function updateUserStatus(user: AdminUser) {
    if (!currentUser || user.disabled === null) return;
    const nextDisabled = !user.disabled;
    const action = nextDisabled ? "disable" : "enable";
    if (
      !window.confirm(
        `Are you sure you want to ${action} ${user.fullName}’s account?`,
      )
    ) {
      return;
    }

    setUpdatingId(user.uid);
    setError("");
    setNotice("");
    try {
      await adminRequest<{ uid: string; disabled: boolean }>(
        currentUser,
        "/api/admin/users",
        {
          method: "PATCH",
          body: JSON.stringify({ uid: user.uid, disabled: nextDisabled }),
        },
      );
      setUsers((existing) =>
        existing.map((record) =>
          record.uid === user.uid
            ? { ...record, disabled: nextDisabled }
            : record,
        ),
      );
      setNotice(
        `${user.fullName}’s account is now ${nextDisabled ? "disabled" : "active"}.`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We couldn’t update this account.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function updateMessageStatus(message: AdminMessage) {
    if (!currentUser) return;
    const nextStatus = message.status === "resolved" ? "open" : "resolved";
    setUpdatingId(message.id);
    setError("");
    setNotice("");
    try {
      await adminRequest<{ id: string; status: AdminMessage["status"] }>(
        currentUser,
        "/api/admin/messages",
        {
          method: "PATCH",
          body: JSON.stringify({ id: message.id, status: nextStatus }),
        },
      );
      setMessages((existing) =>
        existing.map((record) =>
          record.id === message.id ? { ...record, status: nextStatus } : record,
        ),
      );
      setNotice(
        nextStatus === "resolved"
          ? "Message marked as resolved."
          : "Message reopened.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We couldn’t update this message.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function refreshActiveSection() {
    if (!currentUser) return;
    if (activeSection === "users") {
      await loadUsers(true);
    } else if (activeSection === "inbox") {
      await loadMessages(true);
    } else {
      await loadOverview(currentUser);
    }
  }

  async function handleAdminSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSigningIn(true);
    setLoginError("");
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        loginEmail.trim(),
        loginPassword,
      );
      if (!credential.user.emailVerified) {
        await signOut(auth);
        setLoginError(
          "This administrator account still needs a verified email address. Verify it, then sign in again.",
        );
        return;
      }
      setLoginPassword("");
    } catch {
      setLoginError(
        "That email address and password combination is not correct. Please try again.",
      );
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    setCurrentUser(null);
    setOverview(null);
    setUsers([]);
    setMessages([]);
    setUsersLoaded(false);
    setMessagesLoaded(false);
    setMobileNavOpen(false);
    setLoginError("");
  }

  const title =
    activeSection === "overview"
      ? "Overview"
      : activeSection === "users"
        ? "User management"
        : "Contact inbox";

  if (authLoading) {
    return (
      <div className="qlx-admin grid min-h-screen place-items-center bg-[#f4f7fb] text-sm text-slate-500">
        Verifying admin session…
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="qlx-admin grid min-h-screen place-items-center bg-[#f4f7fb] px-4 py-10">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(20,38,61,.08)]">
          <div className="border-b border-slate-100 px-7 pb-6 pt-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf3f8] text-[#075b9d]">
              <AdminIcon name="shield" className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Admin sign-in
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use your QuiloxLedger administrator credentials to open the admin
              console.
            </p>
          </div>

          <form onSubmit={handleAdminSignIn} className="space-y-4 px-7 py-6">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Email address
              </span>
              <input
                type="email"
                name="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                autoComplete="email"
                required
                placeholder="admin@example.com"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#075b9d] focus:bg-white focus:ring-2 focus:ring-[#075b9d]/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Password
              </span>
              <input
                type="password"
                name="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#075b9d] focus:bg-white focus:ring-2 focus:ring-[#075b9d]/15"
              />
            </label>

            {loginError ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium leading-5 text-rose-700"
              >
                <AdminIcon
                  name="close"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                />
                {loginError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={signingIn}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#075b9d] px-5 text-sm font-semibold text-white transition hover:bg-[#064c82] active:scale-[.98] disabled:opacity-60"
            >
              <AdminIcon name="lock" className="h-4 w-4" />
              {signingIn ? "Signing in…" : "Sign in to console"}
            </button>

            <p className="pt-1 text-center text-[11px] leading-5 text-slate-400">
              Access is restricted to authorized administrator accounts.
            </p>
          </form>
        </div>
      </div>
    );
  }

  const accessDenied = errorStatus === 403;
  const serviceUnavailable = errorStatus === 503;

  return (
    <div className="qlx-admin min-h-screen bg-[#f4f7fb] text-[#172334]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col bg-[#111f2d] text-white md:flex">
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1c3850] text-[#77c7bd]">
            <AdminIcon name="shield" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold tracking-wide">QuiloxLedger</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.17em] text-slate-400">
              Admin console
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Admin sections">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">
            Workspace
          </p>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                setActiveSection(section.id);
                setSearch("");
                setError("");
              }}
              className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition ${
                activeSection === section.id
                  ? "bg-[#1d394f] text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/[.06] hover:text-white"
              }`}
            >
              <AdminIcon name={section.icon} className="h-[18px] w-[18px]" />
              {section.label}
              {section.id === "inbox" && overview?.metrics.totalMessages ? (
                <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-200">
                  {overview.metrics.totalMessages}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#27445b] text-xs font-bold text-white">
              {initials(currentUser.displayName || currentUser.email || "A")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {currentUser.displayName || "Administrator"}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                {currentUser.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-xs font-semibold text-slate-400 transition hover:bg-white/[.06] hover:text-white"
          >
            <AdminIcon name="logout" className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="md:ml-[252px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-9">
            <div className="min-w-0">
              <div className="flex items-center gap-2 md:hidden">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#eaf3f8] text-[#075b9d]">
                  <AdminIcon name="shield" className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold text-slate-900">
                  QuiloxLedger Admin
                </span>
              </div>
              <p className="hidden text-[10px] font-bold uppercase tracking-[.15em] text-[#16875a] md:block">
                Administration
              </p>
              <h1 className="mt-1 truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {title}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={refreshActiveSection}
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:px-4"
              >
                <AdminIcon
                  name="refresh"
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                aria-expanded={mobileNavOpen}
                aria-controls="admin-mobile-nav"
                aria-label={
                  mobileNavOpen
                    ? "Close admin navigation"
                    : "Open admin navigation"
                }
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-95 md:hidden"
              >
                <AdminIcon
                  name={mobileNavOpen ? "close" : "menu"}
                  className="h-5 w-5"
                />
              </button>
              <span className="hidden h-10 w-10 place-items-center rounded-full bg-[#e5f1f4] text-xs font-bold text-[#145c62] sm:grid">
                {initials(currentUser.displayName || currentUser.email || "A")}
              </span>
            </div>
          </div>
          {mobileNavOpen ? (
            <nav
              id="admin-mobile-nav"
              aria-label="Admin sections"
              className="border-t border-slate-100 bg-white px-3 pb-3 pt-2 md:hidden"
            >
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e5f1f4] text-xs font-bold text-[#145c62]">
                  {initials(
                    currentUser.displayName || currentUser.email || "A",
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {currentUser.displayName || "Administrator"}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(section.id);
                      setSearch("");
                      setError("");
                      setMobileNavOpen(false);
                    }}
                    className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition active:scale-[.99] ${
                      activeSection === section.id
                        ? "bg-[#eaf3f8] text-[#075b9d]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <AdminIcon
                      name={section.icon}
                      className="h-[18px] w-[18px]"
                    />
                    {section.label}
                    {section.id === "inbox" &&
                    overview?.metrics.totalMessages ? (
                      <span className="ml-auto rounded-full bg-[#075b9d]/10 px-2 py-0.5 text-[10px] font-bold text-[#075b9d]">
                        {overview.metrics.totalMessages}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-2 flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <AdminIcon name="logout" className="h-[18px] w-[18px]" />
                Sign out
              </button>
            </nav>
          ) : null}
        </header>

        <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
          {error ? (
            <div
              role="alert"
              className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${
                accessDenied
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <div>
                <p className="text-sm font-semibold">
                  {accessDenied
                    ? "Admin access restricted"
                    : serviceUnavailable
                      ? "Admin service unavailable"
                      : "Something needs attention"}
                </p>
                <p className="mt-1 text-xs leading-5 opacity-80">{error}</p>
                {accessDenied ? (
                  <p className="mt-2 text-xs leading-5 opacity-80">
                    Add this verified email address to the server-only{" "}
                    <code>ADMIN_EMAILS</code> setting.
                  </p>
                ) : null}
                {serviceUnavailable ? (
                  <p className="mt-2 text-xs leading-5 opacity-80">
                    Configure <code>ADMIN_EMAILS</code>,{" "}
                    <code>FIREBASE_PROJECT_ID</code>,{" "}
                    <code>FIREBASE_CLIENT_EMAIL</code>, and{" "}
                    <code>FIREBASE_PRIVATE_KEY</code> on the server, then
                    restart it.
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full transition hover:bg-black/5"
                aria-label="Dismiss alert"
              >
                <AdminIcon name="close" className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          {notice ? (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"
            >
              <AdminIcon name="check" className="h-4 w-4" />
              {notice}
            </div>
          ) : null}

          {activeSection === "overview" ? (
            <section className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Platform snapshot
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Live counts and the latest records from Firestore.
                  </p>
                </div>
                {overview?.generatedAt ? (
                  <p className="text-[10px] text-slate-400">
                    Updated {formatDate(overview.generatedAt)}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(20,38,61,.035)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Registered users
                      </p>
                      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        {overview?.metrics.totalUsers.toLocaleString() ?? "—"}
                      </p>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#075b9d]">
                      <AdminIcon name="users" />
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400">
                    User profile records in Firestore
                  </p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(20,38,61,.035)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Contact messages
                      </p>
                      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        {overview?.metrics.totalMessages.toLocaleString() ??
                          "—"}
                      </p>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                      <AdminIcon name="inbox" />
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400">
                    Submitted messages in Firestore
                  </p>
                </article>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(20,38,61,.035)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Recent users
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Latest profile records
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection("users")}
                      className="text-xs font-semibold text-[#075b9d] hover:underline"
                    >
                      View users
                    </button>
                  </div>
                  {!overview ? (
                    <p className="px-5 py-8 text-sm text-slate-500">
                      {loading
                        ? "Loading platform data…"
                        : "User data is not available until the admin service connects."}
                    </p>
                  ) : overview.recentUsers.length ? (
                    <div className="divide-y divide-slate-100">
                      {overview.recentUsers.map((user) => (
                        <div
                          key={user.uid}
                          className="flex items-center gap-3 px-5 py-3.5"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                            {initials(user.fullName)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-800">
                              {user.fullName}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500">
                              {user.email || "No email"}
                            </p>
                          </div>
                          <p className="hidden shrink-0 text-[10px] text-slate-400 sm:block">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-5 py-8 text-sm text-slate-500">
                      No user profiles found.
                    </p>
                  )}
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(20,38,61,.035)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Recent messages
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Latest contact form submissions
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection("inbox")}
                      className="text-xs font-semibold text-[#075b9d] hover:underline"
                    >
                      Open inbox
                    </button>
                  </div>
                  {!overview ? (
                    <p className="px-5 py-8 text-sm text-slate-500">
                      {loading
                        ? "Loading contact messages…"
                        : "Message data is not available until the admin service connects."}
                    </p>
                  ) : overview.recentMessages.length ? (
                    <div className="divide-y divide-slate-100">
                      {overview.recentMessages.map((message) => (
                        <button
                          type="button"
                          key={message.id}
                          onClick={() => setActiveSection("inbox")}
                          className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50"
                        >
                          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                            <AdminIcon name="inbox" className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center justify-between gap-2">
                              <span className="truncate text-xs font-semibold text-slate-800">
                                {message.topic}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {formatDate(message.createdAt)}
                              </span>
                            </span>
                            <span className="mt-1 block truncate text-[11px] text-slate-500">
                              {message.name}: {message.message}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-5 py-8 text-sm text-slate-500">
                      No contact messages yet.
                    </p>
                  )}
                </section>
              </div>
            </section>
          ) : null}

          {activeSection === "users" ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(20,38,61,.035)]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    User directory
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Account details from Firestore and Firebase Authentication.
                  </p>
                </div>
                <label className="relative w-full sm:max-w-[320px]">
                  <AdminIcon
                    name="search"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, email or country"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>
              {loading && !users.length ? (
                <p className="px-6 py-10 text-sm text-slate-500">
                  Loading users…
                </p>
              ) : usersError ? (
                <p className="px-6 py-10 text-sm text-slate-500">
                  User data is unavailable. Resolve the admin service notice
                  above and refresh this list.
                </p>
              ) : filteredUsers.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-[.11em] text-slate-500">
                        <th className="px-6 py-3">User</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Email status</th>
                        <th className="px-4 py-3">Account</th>
                        <th className="px-4 py-3">Joined</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.uid} className="text-xs">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf4f8] text-[10px] font-bold text-[#075b9d]">
                                {initials(user.fullName)}
                              </span>
                              <div className="min-w-0">
                                <p className="max-w-[220px] truncate font-semibold text-slate-800">
                                  {user.fullName}
                                </p>
                                <p className="mt-1 max-w-[220px] truncate text-[11px] text-slate-500">
                                  {user.email || user.uid}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {user.country || user.countryCode || "—"}
                            {user.currency ? ` · ${user.currency}` : ""}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                user.emailVerified
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {user.emailVerified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                                user.disabled === null
                                  ? "text-slate-400"
                                  : user.disabled
                                    ? "text-rose-600"
                                    : "text-emerald-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  user.disabled === null
                                    ? "bg-slate-300"
                                    : user.disabled
                                      ? "bg-rose-500"
                                      : "bg-emerald-500"
                                }`}
                              />
                              {user.disabled === null
                                ? "Unavailable"
                                : user.disabled
                                  ? "Disabled"
                                  : "Active"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {user.disabled !== null ? (
                              <button
                                type="button"
                                disabled={updatingId === user.uid}
                                onClick={() => updateUserStatus(user)}
                                className={`rounded-lg border px-3 py-2 text-[10px] font-semibold transition disabled:opacity-50 ${
                                  user.disabled
                                    ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    : "border-rose-200 text-rose-600 hover:bg-rose-50"
                                }`}
                              >
                                {updatingId === user.uid
                                  ? "Saving…"
                                  : user.disabled
                                    ? "Enable"
                                    : "Disable"}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                Auth account not found
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-6 py-10 text-sm text-slate-500">
                  {users.length
                    ? "No users match your search."
                    : "No user profiles are stored yet."}
                </p>
              )}
              {usersCursor ? (
                <div className="border-t border-slate-100 px-5 py-4 text-center">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => loadUsers()}
                    className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loading ? "Loading…" : "Load more users"}
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          {activeSection === "inbox" ? (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(20,38,61,.035)] sm:px-5">
                <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                  {(["all", "open", "resolved"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setMessageFilter(filter)}
                      className={`rounded-lg px-3 py-2 text-[11px] font-semibold capitalize transition ${
                        messageFilter === filter
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {filter === "all" ? "All messages" : filter}
                    </button>
                  ))}
                </div>
                <label className="relative w-full sm:max-w-[320px]">
                  <AdminIcon
                    name="search"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search messages"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              {loading && !messages.length ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                  Loading contact messages…
                </div>
              ) : messagesError ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                  Contact messages are unavailable. Resolve the admin service
                  notice above and refresh the inbox.
                </div>
              ) : filteredMessages.length ? (
                <div className="space-y-3">
                  {filteredMessages.map((message) => (
                    <article
                      key={message.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(20,38,61,.025)] sm:p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef5f8] text-[#075b9d]">
                            <AdminIcon
                              name="inbox"
                              className="h-[18px] w-[18px]"
                            />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-sm font-bold text-slate-900">
                                {message.topic}
                              </h2>
                              <span
                                className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${
                                  message.status === "resolved"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {message.status}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                              {message.name}{" "}
                              <span className="text-slate-300">·</span>{" "}
                              <a
                                href={`mailto:${encodeURIComponent(message.email)}`}
                                className="font-medium text-[#075b9d] hover:underline"
                              >
                                {message.email}
                              </a>
                            </p>
                          </div>
                        </div>
                        <p className="shrink-0 text-[10px] text-slate-400">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">
                        {message.message}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[10px] text-slate-400">
                          Reference {message.id.slice(0, 8).toUpperCase()}
                        </span>
                        <div className="flex gap-2">
                          <a
                            href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: ${message.topic}`)}`}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            Reply by email
                          </a>
                          <button
                            type="button"
                            disabled={updatingId === message.id}
                            onClick={() => updateMessageStatus(message)}
                            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[10px] font-semibold transition disabled:opacity-50 ${
                              message.status === "resolved"
                                ? "border border-blue-200 text-blue-700 hover:bg-blue-50"
                                : "bg-[#075b9d] text-white hover:bg-[#064c82]"
                            }`}
                          >
                            {message.status === "resolved" ? (
                              <AdminIcon name="clock" className="h-3.5 w-3.5" />
                            ) : (
                              <AdminIcon name="check" className="h-3.5 w-3.5" />
                            )}
                            {updatingId === message.id
                              ? "Saving…"
                              : message.status === "resolved"
                                ? "Reopen"
                                : "Mark resolved"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                    <AdminIcon name="inbox" />
                  </span>
                  <h2 className="mt-4 text-sm font-bold text-slate-800">
                    No messages found
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Try another filter or search term.
                  </p>
                </div>
              )}

              {messagesCursor ? (
                <div className="text-center">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => loadMessages()}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loading ? "Loading…" : "Load older messages"}
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
