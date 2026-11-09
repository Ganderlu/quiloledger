"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type ContactIconName =
  | "mail"
  | "chat"
  | "book"
  | "clock"
  | "shield"
  | "check"
  | "arrow";

function ContactIcon({
  name,
  className = "h-5 w-5",
}: {
  name: ContactIconName;
  className?: string;
}) {
  const props = {
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
    case "mail":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 7.5 8 5.5 8-5.5" />
        </svg>
      );
    case "chat":
      return (
        <svg {...props}>
          <path d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z" />
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5v-12Z" />
          <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 3 19 6v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...props}>
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      );
    default:
      return null;
  }
}

const topics = [
  "General question",
  "Account support",
  "Payments and cards",
  "Security concern",
  "Partnership",
  "Developer and API",
];

type FieldErrors = {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setEmail((current) => current || currentUser.email || "");
        setName((current) => current || currentUser.displayName || "");
      }
    });
    return () => unsubscribe();
  }, []);

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (name.trim().length < 2) {
      next.name = "Please enter your full name.";
    }
    if (!emailPattern.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!topic) {
      next.topic = "Please choose a topic.";
    }
    if (message.trim().length < 10) {
      next.message = "Please add a little more detail (at least 10 characters).";
    }

    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "contactMessages"), {
        name: name.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
        userId: user?.uid ?? null,
        createdAt: serverTimestamp(),
      });

      setReference(docRef.id.slice(0, 8).toUpperCase());
      setName(user?.displayName ?? "");
      setEmail(user?.email ?? "");
      setTopic("");
      setMessage("");
      setErrors({});
    } catch {
      setFormError(
        "We could not send your message right now. Please try again, or reach us through the help center.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-4 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-blue-50 via-white to-white px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 dark:border-zinc-800 dark:from-blue-950/40 dark:via-zinc-950 dark:to-zinc-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15"
        />
        <div className="relative mx-auto w-full max-w-[1440px]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              <ContactIcon name="mail" className="h-3.5 w-3.5" />
              Contact us
            </span>
            <h1 className="mt-5 text-pretty text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl dark:text-white">
              Talk to the QuiloxLedger team
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base dark:text-zinc-300">
              Send us a message and we will point you in the right direction.
              Share as much detail as you can so we can help quickly.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.75fr)] lg:gap-10">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
            {reference ? (
              <div className="flex flex-col items-start">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <ContactIcon name="check" className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">
                  Your message has been sent
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  Thank you for reaching out. Our team reviews every message, and
                  we will follow up using the email address you provided.
                </p>
                <dl className="mt-6 w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Reference
                  </dt>
                  <dd className="mt-1.5 font-mono text-lg font-semibold tracking-wider text-zinc-950 dark:text-white">
                    {reference}
                  </dd>
                </dl>
                <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setReference(null)}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-blue-700 px-6 text-sm font-semibold text-white transition hover:bg-blue-800 active:scale-[.99] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    Send another message
                  </button>
                  <Link
                    href="/help"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-zinc-200 px-6 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    Browse the help center
                    <ContactIcon name="arrow" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">
                  Send us a message
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Fields marked with an asterisk are required.
                </p>

                <form onSubmit={handleSubmit} noValidate className="mt-7 grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                      >
                        Full name <span className="text-blue-700">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        aria-invalid={Boolean(errors.name)}
                        className={`mt-2 ${inputClass} ${
                          errors.name
                            ? "border-red-300 focus:border-red-400 focus:ring-red-500/10 dark:border-red-500/50"
                            : "border-zinc-200 focus:border-blue-400 focus:ring-blue-500/10 dark:border-zinc-700 dark:focus:border-blue-500"
                        }`}
                        placeholder="Ada Okafor"
                      />
                      {errors.name ? (
                        <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                          {errors.name}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                      >
                        Email <span className="text-blue-700">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        aria-invalid={Boolean(errors.email)}
                        className={`mt-2 ${inputClass} ${
                          errors.email
                            ? "border-red-300 focus:border-red-400 focus:ring-red-500/10 dark:border-red-500/50"
                            : "border-zinc-200 focus:border-blue-400 focus:ring-blue-500/10 dark:border-zinc-700 dark:focus:border-blue-500"
                        }`}
                        placeholder="you@example.com"
                      />
                      {errors.email ? (
                        <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                          {errors.email}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-topic"
                      className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                    >
                      Topic <span className="text-blue-700">*</span>
                    </label>
                    <select
                      id="contact-topic"
                      name="topic"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      aria-invalid={Boolean(errors.topic)}
                      className={`mt-2 ${inputClass} appearance-none ${
                        topic
                          ? ""
                          : "text-zinc-400 dark:text-zinc-500"
                      } ${
                        errors.topic
                          ? "border-red-300 focus:border-red-400 focus:ring-red-500/10 dark:border-red-500/50"
                          : "border-zinc-200 focus:border-blue-400 focus:ring-blue-500/10 dark:border-zinc-700 dark:focus:border-blue-500"
                      }`}
                    >
                      <option value="">Select a topic</option>
                      {topics.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {errors.topic ? (
                      <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                        {errors.topic}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                    >
                      Message <span className="text-blue-700">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={6}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      aria-invalid={Boolean(errors.message)}
                      className={`mt-2 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-4 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
                        errors.message
                          ? "border-red-300 focus:border-red-400 focus:ring-red-500/10 dark:border-red-500/50"
                          : "border-zinc-200 focus:border-blue-400 focus:ring-blue-500/10 dark:border-zinc-700 dark:focus:border-blue-500"
                      }`}
                      placeholder="Tell us what you need help with. Include any details that may be useful."
                    />
                    {errors.message ? (
                      <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                        {errors.message}
                      </p>
                    ) : null}
                  </div>

                  {formError ? (
                    <div
                      role="alert"
                      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                    >
                      {formError}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[.99] sm:w-auto sm:px-8 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    {submitting ? "Sending…" : "Send message"}
                  </button>

                  <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    We use your details only to respond to this request. Please
                    do not include passwords or private keys.
                  </p>
                </form>
              </>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                <ContactIcon name="book" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">
                Looking for an answer now?
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Many questions are covered in our help center guides and
                frequently asked questions.
              </p>
              <Link
                href="/help"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:gap-2.5 dark:text-blue-300"
              >
                Visit the help center
                <ContactIcon name="arrow" className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                <ContactIcon name="clock" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">
                How we handle requests
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Messages are reviewed in the order they arrive. Account-specific
                requests are best sent from the email address on your account.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                <ContactIcon name="shield" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">
                Stay safe
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                QuiloxLedger will never ask for your password, recovery phrase,
                or private keys.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-blue-700 dark:bg-zinc-950 dark:text-blue-300">
                  <ContactIcon name="chat" className="h-[18px] w-[18px]" />
                </span>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  Signed in?{" "}
                  <Link
                    href="/settings"
                    className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
                  >
                    Open Settings
                  </Link>{" "}
                  for account-specific controls.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
