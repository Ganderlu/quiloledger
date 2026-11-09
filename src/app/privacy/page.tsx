import Link from "next/link";

const lastUpdated = "November 8, 2026";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "information-we-collect", title: "Information we collect" },
  { id: "how-we-use", title: "How we use information" },
  { id: "cookies", title: "Cookies and local storage" },
  { id: "service-providers", title: "Service providers" },
  { id: "retention", title: "Data retention" },
  { id: "security", title: "Security" },
  { id: "your-choices", title: "Your choices and rights" },
  { id: "children", title: "Children's privacy" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact us" },
];

function SectionHeading({ id, title }: { id: string; title: string }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-lg font-semibold tracking-tight text-zinc-950 sm:text-xl dark:text-white"
    >
      {title}
    </h2>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-blue-50 via-white to-white px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 dark:border-zinc-800 dark:from-blue-950/40 dark:via-zinc-950 dark:to-zinc-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15"
        />
        <div className="relative mx-auto w-full max-w-[1440px]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              Legal
            </span>
            <h1 className="mt-5 text-pretty text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl dark:text-white">
              Privacy Policy
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base dark:text-zinc-300">
              This policy explains what information QuiloxLedger collects, how
              we use it, and the choices you have.
            </p>
            <p className="mt-5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              On this page
            </p>
            <nav aria-label="Privacy policy sections" className="mt-4">
              <ol className="space-y-1 lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 lg:-ml-px lg:rounded-none lg:border-l-2 lg:border-transparent lg:hover:border-blue-500 lg:hover:bg-transparent lg:dark:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <span className="text-[11px] font-semibold tabular-nums text-zinc-400 dark:text-zinc-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="max-w-3xl">
            <div className="space-y-10">
              <div className="space-y-4">
                <SectionHeading id="overview" title="1. Overview" />
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  QuiloxLedger provides a digital wallet interface that helps
                  you view balances, explore digital assets, and preview wallet
                  actions. This Privacy Policy explains what information we
                  collect when you use the QuiloxLedger website and wallet, how
                  we use it, and the choices available to you.
                </p>
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  By creating an account or using the service, you agree to the
                  practices described in this policy.
                </p>
              </div>

              <div className="space-y-4">
                <SectionHeading
                  id="information-we-collect"
                  title="2. Information we collect"
                />
                <dl className="space-y-4">
                  {[
                    {
                      term: "Account information",
                      detail:
                        "When you register, we collect your email address, your chosen password (handled and secured by our authentication provider, never stored in plain text), your full name, country, preferred currency, and an optional referral ID.",
                    },
                    {
                      term: "Contact information",
                      detail:
                        "When you submit our contact form, we collect your name, email address, selected topic, and message.",
                    },
                    {
                      term: "Preferences",
                      detail:
                        "We store display preferences such as your theme (light or dark), currency, whether balances are hidden, and any watchlist you create in the asset list.",
                    },
                    {
                      term: "Usage and device information",
                      detail:
                        "We collect limited analytics about how the service is used, such as pages viewed and general interaction events, along with technical information like browser type and approximate region.",
                    },
                  ].map((item) => (
                    <div
                      key={item.term}
                      className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <dt className="text-sm font-semibold text-zinc-950 dark:text-white">
                        {item.term}
                      </dt>
                      <dd className="mt-1.5 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                        {item.detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="space-y-4">
                <SectionHeading
                  id="how-we-use"
                  title="3. How we use information"
                />
                <ul className="space-y-3">
                  {[
                    "Create and secure your account, and let you sign in.",
                    "Store your profile and preferences so the wallet behaves consistently.",
                    "Respond to messages you send through our contact page.",
                    "Understand how features are used so we can improve them.",
                    "Maintain the security and integrity of the service.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
                      />
                      <span className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  We do not sell your personal information.
                </p>
              </div>

              <div className="space-y-4">
                <SectionHeading
                  id="cookies"
                  title="4. Cookies and local storage"
                />
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  We use a small number of browser storage technologies:
                </p>
                <ul className="space-y-3">
                  {[
                    "A cookie named qlx-theme records whether you prefer light or dark display so pages render correctly.",
                    "Local storage keeps preferences such as hide-balance, currency, and your asset watchlist on your own device.",
                    "Our analytics provider may set identifiers to measure usage.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
                      />
                      <span className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  You can clear or block cookies and local storage in your
                  browser settings. Some preferences may reset if you do.
                </p>
              </div>

              <div className="space-y-4">
                <SectionHeading
                  id="service-providers"
                  title="5. Service providers"
                />
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  We rely on trusted third parties to operate the service,
                  including Google Firebase for authentication, database
                  (Firestore), and analytics. These providers process
                  information on our behalf and are bound by their own terms and
                  privacy commitments.
                </p>
              </div>

              <div className="space-y-4">
                <SectionHeading id="retention" title="6. Data retention" />
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  We keep account and contact information for as long as your
                  account is active or as needed to respond to your request.
                  When information is no longer needed, we delete or anonymise
                  it, unless we are required to retain it for legal or security
                  reasons.
                </p>
              </div>

              <div className="space-y-4">
                <SectionHeading id="security" title="7. Security" />
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  We use industry-standard measures, including encrypted
                  connections and a managed authentication provider, to protect
                  your information. No method of transmission or storage is
                  completely secure, so we cannot guarantee absolute security.
                  Keep your password private and use a strong, unique one.
                </p>
              </div>

              <div className="space-y-4">
                <SectionHeading
                  id="your-choices"
                  title="8. Your choices and rights"
                />
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  Depending on where you live, you may have the right to access,
                  correct, or delete your personal information, or to object to
                  certain processing. Some details can be updated directly in
                  Settings. To make a request, reach us through the contact
                  page.
                </p>
              </div>

              <div className="space-y-4">
                <SectionHeading id="children" title="9. Children's privacy" />
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  QuiloxLedger is not intended for children. We do not knowingly
                  collect personal information from anyone under the age
                  required by their local law. If you believe a child has
                  provided us with information, please contact us so we can
                  remove it.
                </p>
              </div>

              <div className="space-y-4">
                <SectionHeading
                  id="changes"
                  title="10. Changes to this policy"
                />
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  We may update this policy from time to time. When we do, we
                  will revise the &ldquo;last updated&rdquo; date at the top of
                  this page. Significant changes will be communicated through
                  the service where appropriate.
                </p>
              </div>

              <div className="space-y-4">
                <SectionHeading id="contact" title="11. Contact us" />
                <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  If you have questions about this policy or how your
                  information is handled, reach us through the contact page. You
                  can also review the help center for general guides.
                </p>
              </div>
            </div>

            <div className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
                Questions about your data?
              </h2>
              <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                Send us a message and we will help you with privacy requests or
                account questions.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-blue-700 px-6 text-sm font-semibold text-white transition hover:bg-blue-800 active:scale-[.99] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Contact us
                </Link>
                <Link
                  href="/help"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-white/10"
                >
                  Visit the help center
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
