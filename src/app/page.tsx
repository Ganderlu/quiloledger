export default function Home() {
  return (
    <>
      <section className="qlx-night-bg relative overflow-hidden">
        <div
          aria-hidden="true"
          className="qlx-hero-scrim pointer-events-none absolute inset-0"
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-24 pt-28 sm:pb-32 sm:pt-36 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col">
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="block">Own Your Crypto.</span>
              <span className="block">Be Your Future.</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-white/80 sm:text-lg">
              Unlock the power of your cryptocurrency assets and explore the
              world of Web3 with QuiloxLedger.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/dashboard"
                className="group inline-flex items-center gap-3 rounded-full border border-white/30 px-5 py-3 text-left text-white transition-colors hover:bg-white/10"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-white group-hover:bg-blue-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                  >
                    <path
                      d="M9 4H15C16.1 4 17 4.9 17 6V18C17 19.1 16.1 20 15 20H9C7.9 20 7 19.1 7 18V6C7 4.9 7.9 4 9 4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M11 17H13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                    Download
                  </span>
                  <span className="text-sm font-semibold">Mobile App</span>
                </span>
              </a>

              <a
                href="/dashboard"
                className="group inline-flex items-center gap-3 rounded-full border border-white/30 px-5 py-3 text-left text-white transition-colors hover:bg-white/10"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-white group-hover:bg-blue-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                  >
                    <path
                      d="M4 6C4 4.9 4.9 4 6 4H18C19.1 4 20 4.9 20 6V16C20 17.1 19.1 18 18 18H6C4.9 18 4 17.1 4 16V6Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 20H16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                    Download
                  </span>
                  <span className="text-sm font-semibold">Extension</span>
                </span>
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative aspect-[4/3] w-full">
              <div className="relative h-full w-full">
                <div className="block dark:hidden">
                  <svg
                    viewBox="0 0 900 650"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full"
                  >
                    <defs>
                      <linearGradient
                        id="qlx_g1_light"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0" stopColor="#2563eb" />
                        <stop offset="0.5" stopColor="#7c3aed" />
                        <stop offset="1" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient
                        id="qlx_g2_light"
                        x1="0"
                        y1="1"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0" stopColor="#0b1220" />
                        <stop offset="1" stopColor="#111827" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M642 90C748 104 870 228 844 340C818 452 632 547 496 536C360 525 218 435 210 325C202 215 338 62 474 74C544 80 590 83 642 90Z"
                      fill="url(#qlx_g1_light)"
                      opacity="0.12"
                    />

                    <g>
                      <path
                        d="M565 140C565 111 588 88 617 88H741C770 88 793 111 793 140V514C793 543 770 566 741 566H617C588 566 565 543 565 514V140Z"
                        fill="url(#qlx_g2_light)"
                        stroke="#1f2937"
                        strokeWidth="2"
                      />
                      <rect
                        x="592"
                        y="132"
                        width="174"
                        height="22"
                        rx="11"
                        fill="#0f172a"
                      />
                      <rect
                        x="592"
                        y="175"
                        width="174"
                        height="48"
                        rx="14"
                        fill="#0f172a"
                      />

                      {/* Bitcoin Row */}
                      <g transform="translate(605, 175)">
                        <circle cx="15" cy="24" r="15" fill="#F7931A" />
                        <path
                          d="M15 15v18m3-18v18m-6-15h7c2 0 3 1 3 3s-1 3-3 3h-7m0 0h8c2 0 3 1 3 3s-1 3-3 3h-8"
                          stroke="white"
                          strokeWidth="2"
                          fill="none"
                        />
                        <text
                          x="40"
                          y="18"
                          fill="white"
                          fontSize="14"
                          fontWeight="600"
                        >
                          Bitcoin
                        </text>
                        <text
                          x="40"
                          y="34"
                          fill="white"
                          opacity="0.5"
                          fontSize="10"
                        >
                          0.45 BTC
                        </text>
                        <text
                          x="160"
                          y="26"
                          fill="white"
                          fontSize="12"
                          fontWeight="600"
                          textAnchor="end"
                        >
                          $28,450.00
                        </text>
                      </g>

                      <rect
                        x="592"
                        y="240"
                        width="174"
                        height="90"
                        rx="16"
                        fill="#0f172a"
                      />
                      <rect
                        x="592"
                        y="345"
                        width="174"
                        height="64"
                        rx="16"
                        fill="#0f172a"
                      />

                      {/* Ethereum Row */}
                      <g transform="translate(605, 345)">
                        <circle cx="15" cy="24" r="15" fill="#627EEA" />
                        <path
                          d="M15 12l6 8-6 12-6-12 6-8z M15 20l6-2-6-8-6 8 6 2z"
                          fill="white"
                        />
                        <text
                          x="40"
                          y="18"
                          fill="white"
                          fontSize="14"
                          fontWeight="600"
                        >
                          Ethereum
                        </text>
                        <text
                          x="40"
                          y="34"
                          fill="white"
                          opacity="0.5"
                          fontSize="10"
                        >
                          12.5 ETH
                        </text>
                        <text
                          x="160"
                          y="26"
                          fill="white"
                          fontSize="12"
                          fontWeight="600"
                          textAnchor="end"
                        >
                          $32,120.00
                        </text>
                      </g>

                      <rect
                        x="592"
                        y="425"
                        width="174"
                        height="64"
                        rx="16"
                        fill="#0f172a"
                      />
                      <circle cx="679" cy="530" r="10" fill="#1f2937" />
                    </g>

                    <g>
                      <path
                        d="M310 230C310 205 330 185 355 185H468C493 185 513 205 513 230V472C513 497 493 517 468 517H355C330 517 310 497 310 472V230Z"
                        fill="#ffffff"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                      <rect
                        x="334"
                        y="220"
                        width="155"
                        height="22"
                        rx="11"
                        fill="#f1f5f9"
                      />

                      {/* Solana Row */}
                      <g transform="translate(345, 255)">
                        <circle cx="12" cy="18" r="12" fill="#14F195" />
                        <path
                          d="M8 12h8l-2 3H6l2-3z M6 17h8l-2 3H4l2-3z M4 22h8l-2 3H2l2-3z"
                          fill="white"
                          transform="scale(0.8) translate(4, 4)"
                        />
                        <rect
                          x="30"
                          y="10"
                          width="70"
                          height="6"
                          rx="3"
                          fill="#e2e8f0"
                        />
                        <rect
                          x="30"
                          y="22"
                          width="40"
                          height="6"
                          rx="3"
                          fill="#e2e8f0"
                          opacity="0.5"
                        />
                      </g>

                      <rect
                        x="334"
                        y="315"
                        width="155"
                        height="36"
                        rx="14"
                        fill="#f1f5f9"
                      />

                      {/* Generic Coin Row */}
                      <g transform="translate(345, 363)">
                        <circle cx="12" cy="18" r="12" fill="#3b82f6" />
                        <rect
                          x="30"
                          y="10"
                          width="70"
                          height="6"
                          rx="3"
                          fill="#e2e8f0"
                        />
                        <rect
                          x="30"
                          y="22"
                          width="40"
                          height="6"
                          rx="3"
                          fill="#e2e8f0"
                          opacity="0.5"
                        />
                      </g>

                      <rect
                        x="334"
                        y="411"
                        width="155"
                        height="36"
                        rx="14"
                        fill="#f1f5f9"
                      />
                      <circle cx="412" cy="485" r="9" fill="#e5e7eb" />
                    </g>

                    <g>
                      <path
                        d="M770 220L860 275L770 330L680 275L770 220Z"
                        fill="url(#qlx_g1_light)"
                        opacity="0.9"
                      />
                      <path
                        d="M770 240L838 281L770 322L702 281L770 240Z"
                        fill="#0b1220"
                        opacity="0.55"
                      />
                    </g>

                    <g>
                      <rect
                        x="660"
                        y="400"
                        width="120"
                        height="82"
                        rx="18"
                        fill="#ffffff"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                      <rect
                        x="676"
                        y="418"
                        width="88"
                        height="10"
                        rx="5"
                        fill="#e2e8f0"
                      />
                      <rect
                        x="676"
                        y="438"
                        width="68"
                        height="10"
                        rx="5"
                        fill="#e2e8f0"
                      />
                      <circle
                        cx="756"
                        cy="454"
                        r="10"
                        fill="url(#qlx_g1_light)"
                      />
                    </g>
                  </svg>
                </div>

                <div className="hidden dark:block">
                  <svg
                    viewBox="0 0 900 650"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full"
                  >
                    <defs>
                      <linearGradient
                        id="qlx_g1_dark"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0" stopColor="#60a5fa" />
                        <stop offset="0.5" stopColor="#a78bfa" />
                        <stop offset="1" stopColor="#34d399" />
                      </linearGradient>
                      <linearGradient
                        id="qlx_g2_dark"
                        x1="0"
                        y1="1"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0" stopColor="#020617" />
                        <stop offset="1" stopColor="#0b1220" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M642 90C748 104 870 228 844 340C818 452 632 547 496 536C360 525 218 435 210 325C202 215 338 62 474 74C544 80 590 83 642 90Z"
                      fill="url(#qlx_g1_dark)"
                      opacity="0.16"
                    />

                    <g>
                      <path
                        d="M565 140C565 111 588 88 617 88H741C770 88 793 111 793 140V514C793 543 770 566 741 566H617C588 566 565 543 565 514V140Z"
                        fill="url(#qlx_g2_dark)"
                        stroke="#334155"
                        strokeWidth="2"
                      />
                      <rect
                        x="592"
                        y="132"
                        width="174"
                        height="22"
                        rx="11"
                        fill="#0b1220"
                      />
                      <rect
                        x="592"
                        y="175"
                        width="174"
                        height="48"
                        rx="14"
                        fill="#0b1220"
                      />

                      {/* Bitcoin Row */}
                      <g transform="translate(605, 175)">
                        <circle cx="15" cy="24" r="15" fill="#F7931A" />
                        <path
                          d="M15 15v18m3-18v18m-6-15h7c2 0 3 1 3 3s-1 3-3 3h-7m0 0h8c2 0 3 1 3 3s-1 3-3 3h-8"
                          stroke="white"
                          strokeWidth="2"
                          fill="none"
                        />
                        <text
                          x="40"
                          y="18"
                          fill="white"
                          fontSize="14"
                          fontWeight="600"
                        >
                          Bitcoin
                        </text>
                        <text
                          x="40"
                          y="34"
                          fill="white"
                          opacity="0.5"
                          fontSize="10"
                        >
                          0.45 BTC
                        </text>
                        <text
                          x="160"
                          y="26"
                          fill="white"
                          fontSize="12"
                          fontWeight="600"
                          textAnchor="end"
                        >
                          $28,450.00
                        </text>
                      </g>

                      <rect
                        x="592"
                        y="240"
                        width="174"
                        height="90"
                        rx="16"
                        fill="#0b1220"
                      />
                      <rect
                        x="592"
                        y="345"
                        width="174"
                        height="64"
                        rx="16"
                        fill="#0b1220"
                      />

                      {/* Ethereum Row */}
                      <g transform="translate(605, 345)">
                        <circle cx="15" cy="24" r="15" fill="#627EEA" />
                        <path
                          d="M15 12l6 8-6 12-6-12 6-8z M15 20l6-2-6-8-6 8 6 2z"
                          fill="white"
                        />
                        <text
                          x="40"
                          y="18"
                          fill="white"
                          fontSize="14"
                          fontWeight="600"
                        >
                          Ethereum
                        </text>
                        <text
                          x="40"
                          y="34"
                          fill="white"
                          opacity="0.5"
                          fontSize="10"
                        >
                          12.5 ETH
                        </text>
                        <text
                          x="160"
                          y="26"
                          fill="white"
                          fontSize="12"
                          fontWeight="600"
                          textAnchor="end"
                        >
                          $32,120.00
                        </text>
                      </g>

                      <rect
                        x="592"
                        y="425"
                        width="174"
                        height="64"
                        rx="16"
                        fill="#0b1220"
                      />
                      <circle cx="679" cy="530" r="10" fill="#334155" />
                    </g>

                    <g>
                      <path
                        d="M310 230C310 205 330 185 355 185H468C493 185 513 205 513 230V472C513 497 493 517 468 517H355C330 517 310 497 310 472V230Z"
                        fill="#0b1220"
                        stroke="#334155"
                        strokeWidth="2"
                      />
                      <rect
                        x="334"
                        y="220"
                        width="155"
                        height="22"
                        rx="11"
                        fill="#111827"
                      />

                      {/* Solana Row */}
                      <g transform="translate(345, 255)">
                        <circle cx="12" cy="18" r="12" fill="#14F195" />
                        <path
                          d="M8 12h8l-2 3H6l2-3z M6 17h8l-2 3H4l2-3z M4 22h8l-2 3H2l2-3z"
                          fill="white"
                          transform="scale(0.8) translate(4, 4)"
                        />
                        <rect
                          x="30"
                          y="10"
                          width="70"
                          height="6"
                          rx="3"
                          fill="#1e293b"
                        />
                        <rect
                          x="30"
                          y="22"
                          width="40"
                          height="6"
                          rx="3"
                          fill="#1e293b"
                          opacity="0.5"
                        />
                      </g>

                      <rect
                        x="334"
                        y="315"
                        width="155"
                        height="36"
                        rx="14"
                        fill="#111827"
                      />

                      {/* Generic Coin Row */}
                      <g transform="translate(345, 363)">
                        <circle cx="12" cy="18" r="12" fill="#3b82f6" />
                        <rect
                          x="30"
                          y="10"
                          width="70"
                          height="6"
                          rx="3"
                          fill="#1e293b"
                        />
                        <rect
                          x="30"
                          y="22"
                          width="40"
                          height="6"
                          rx="3"
                          fill="#1e293b"
                          opacity="0.5"
                        />
                      </g>

                      <rect
                        x="334"
                        y="411"
                        width="155"
                        height="36"
                        rx="14"
                        fill="#111827"
                      />
                      <circle cx="412" cy="485" r="9" fill="#334155" />
                    </g>

                    <g>
                      <path
                        d="M770 220L860 275L770 330L680 275L770 220Z"
                        fill="url(#qlx_g1_dark)"
                        opacity="0.9"
                      />
                      <path
                        d="M770 240L838 281L770 322L702 281L770 240Z"
                        fill="#020617"
                        opacity="0.6"
                      />
                    </g>

                    <g>
                      <rect
                        x="660"
                        y="400"
                        width="120"
                        height="82"
                        rx="18"
                        fill="#0b1220"
                        stroke="#334155"
                        strokeWidth="2"
                      />
                      <rect
                        x="676"
                        y="418"
                        width="88"
                        height="10"
                        rx="5"
                        fill="#111827"
                      />
                      <rect
                        x="676"
                        y="438"
                        width="68"
                        height="10"
                        rx="5"
                        fill="#111827"
                      />
                      <circle
                        cx="756"
                        cy="454"
                        r="10"
                        fill="url(#qlx_g1_dark)"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:py-16">
        <section className="mt-16 w-full">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-amber-100 via-rose-100 to-fuchsia-200 px-6 py-12 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 sm:px-10 lg:px-12">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-balance text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
                Browse a world of dApps
              </h2>
              <p className="mt-4 text-pretty text-base leading-7 text-zinc-700 dark:text-zinc-300 sm:text-lg">
                Access Web3 and DeFi opportunities with the QuiloxLedger dApp
                browser.
              </p>
            </div>

            <div className="mt-10 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 sm:p-10">
              <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
                <div>
                  <h3 className="text-balance text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                    Deposit crypto easily from exchanges
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:text-base sm:leading-7">
                    Take control of your crypto. Avoid complicated steps and
                    deposit directly to your wallet from exchanges like Binance
                    and Coinbase.
                  </p>

                  <a
                    href="/receive"
                    className="mt-7 inline-flex h-12 items-center justify-center rounded-full border border-blue-600 px-8 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-white/10"
                  >
                    Get started with deposits
                  </a>
                </div>

                <div className="relative mx-auto w-full max-w-lg">
                  <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-emerald-600/10 blur-2xl dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-emerald-600/20" />
                  <svg
                    viewBox="0 0 640 420"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-auto w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="qlx_phone_grad"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0" stopColor="#60a5fa" />
                        <stop offset="0.5" stopColor="#a78bfa" />
                        <stop offset="1" stopColor="#34d399" />
                      </linearGradient>
                      <linearGradient
                        id="qlx_hand_grad"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0" stopColor="#0b1220" />
                        <stop offset="1" stopColor="#111827" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M410 78C480 55 563 84 595 154C627 224 600 312 533 349C466 386 381 368 332 315C283 262 273 165 323 114C346 90 377 86 410 78Z"
                      fill="url(#qlx_phone_grad)"
                      opacity="0.14"
                    />

                    <g transform="translate(330 52) rotate(12 130 160)">
                      <rect
                        x="44"
                        y="18"
                        width="220"
                        height="354"
                        rx="42"
                        fill="#111827"
                      />
                      <rect
                        x="60"
                        y="34"
                        width="188"
                        height="322"
                        rx="34"
                        fill="#f8fafc"
                      />
                      <rect
                        x="132"
                        y="28"
                        width="44"
                        height="10"
                        rx="5"
                        fill="#334155"
                        opacity="0.6"
                      />
                      <rect
                        x="80"
                        y="62"
                        width="148"
                        height="22"
                        rx="11"
                        fill="#e2e8f0"
                      />
                      <rect
                        x="80"
                        y="98"
                        width="148"
                        height="90"
                        rx="16"
                        fill="#e2e8f0"
                      />
                      <rect
                        x="110"
                        y="110"
                        width="88"
                        height="66"
                        rx="10"
                        fill="#ffffff"
                      />
                      <path
                        d="M120 120H188M120 134H188M120 148H188M120 162H188"
                        stroke="#0b1220"
                        strokeWidth="4"
                        opacity="0.25"
                      />
                      <rect
                        x="80"
                        y="208"
                        width="148"
                        height="24"
                        rx="12"
                        fill="#e2e8f0"
                      />
                      <rect
                        x="80"
                        y="244"
                        width="148"
                        height="24"
                        rx="12"
                        fill="#e2e8f0"
                      />
                      <rect
                        x="80"
                        y="280"
                        width="148"
                        height="24"
                        rx="12"
                        fill="#e2e8f0"
                      />
                    </g>

                    <g transform="translate(40 130)">
                      <path
                        d="M245 210C245 250 212 283 172 283H120C80 283 47 250 47 210V145C47 105 80 72 120 72H172C212 72 245 105 245 145V210Z"
                        fill="url(#qlx_hand_grad)"
                        opacity="0.95"
                      />
                      <path
                        d="M110 90C95 84 79 93 75 109L66 147C61 166 73 186 93 191L132 201"
                        stroke="#0ea5e9"
                        strokeWidth="4"
                        opacity="0.7"
                      />
                      <path
                        d="M200 96C214 90 230 99 233 114L240 152C244 170 232 188 214 192L182 200"
                        stroke="#34d399"
                        strokeWidth="4"
                        opacity="0.7"
                      />
                      <path
                        d="M120 168L150 138L180 168L150 198L120 168Z"
                        fill="url(#qlx_phone_grad)"
                        opacity="0.9"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 w-full">
          <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white px-6 py-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:px-10 lg:px-12">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15" />
              <div className="absolute -bottom-48 -right-48 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />
            </div>

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  Join the QuiloxLedger community
                </div>

                <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                  Build, learn, and ship Web3 with other builders.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base sm:leading-7">
                  Get product updates, developer support, ecosystem news, and
                  early access to new wallet features. Connect with builders and
                  security researchers shaping the next generation of
                  self-custody.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-blue-700 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    Join Discord
                  </a>
                  <a
                    href="#"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 dark:border-zinc-800 dark:text-white dark:hover:bg-white/10"
                  >
                    Follow on X
                  </a>
                  <a
                    href="/docs"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 dark:border-zinc-800 dark:text-white dark:hover:bg-white/10"
                  >
                    Developer Docs
                  </a>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                      Events & AMAs
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      Weekly sessions with builders.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                      Security updates
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      Alerts and best practices.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                      Open ecosystem
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      Integrations and tooling.
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-emerald-600/10 blur-2xl dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-emerald-600/20" />
                <svg
                  viewBox="0 0 520 520"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-auto w-full"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="qlx_orb" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#60a5fa" />
                      <stop offset="0.55" stopColor="#a78bfa" />
                      <stop offset="1" stopColor="#34d399" />
                    </linearGradient>
                  </defs>

                  <circle
                    cx="260"
                    cy="260"
                    r="190"
                    fill="url(#qlx_orb)"
                    opacity="0.18"
                  />
                  <circle
                    cx="260"
                    cy="260"
                    r="150"
                    fill="url(#qlx_orb)"
                    opacity="0.16"
                  />
                  <circle
                    cx="260"
                    cy="260"
                    r="110"
                    fill="url(#qlx_orb)"
                    opacity="0.14"
                  />

                  <path
                    d="M260 95C190 130 140 200 140 260C140 320 190 390 260 425C330 390 380 320 380 260C380 200 330 130 260 95Z"
                    fill="url(#qlx_orb)"
                    opacity="0.9"
                  />
                  <path
                    d="M260 150C214 175 184 217 184 260C184 303 214 345 260 370C306 345 336 303 336 260C336 217 306 175 260 150Z"
                    fill="#0b1220"
                    opacity="0.45"
                  />

                  <path
                    d="M120 260H400"
                    stroke="#93c5fd"
                    strokeWidth="4"
                    strokeDasharray="8 10"
                    opacity="0.65"
                  />
                  <path
                    d="M260 120V400"
                    stroke="#a7f3d0"
                    strokeWidth="4"
                    strokeDasharray="8 10"
                    opacity="0.55"
                  />
                  <circle
                    cx="260"
                    cy="260"
                    r="10"
                    fill="#ffffff"
                    opacity="0.9"
                  />
                  <circle
                    cx="140"
                    cy="260"
                    r="7"
                    fill="#ffffff"
                    opacity="0.75"
                  />
                  <circle
                    cx="380"
                    cy="260"
                    r="7"
                    fill="#ffffff"
                    opacity="0.75"
                  />
                  <circle
                    cx="260"
                    cy="140"
                    r="7"
                    fill="#ffffff"
                    opacity="0.75"
                  />
                  <circle
                    cx="260"
                    cy="380"
                    r="7"
                    fill="#ffffff"
                    opacity="0.75"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-12 w-full border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            <div className="text-lg font-semibold leading-tight tracking-tight text-zinc-950 dark:text-white">
              Trusted by{" "}
              <span className="text-blue-700 dark:text-blue-300">200M</span>{" "}
              people
            </div>
            <div className="text-lg font-semibold leading-tight tracking-tight text-zinc-950 dark:text-white">
              Founded in{" "}
              <span className="text-blue-700 dark:text-blue-300">2017</span>
            </div>
            <div className="text-lg font-semibold leading-tight tracking-tight text-zinc-950 dark:text-white">
              Independently{" "}
              <span className="text-blue-700 dark:text-blue-300">Audited</span>
            </div>
            <div className="text-lg font-semibold leading-tight tracking-tight text-zinc-950 dark:text-white">
              ISO{" "}
              <span className="text-blue-700 dark:text-blue-300">
                Certified
              </span>
            </div>
            <div className="text-lg font-semibold leading-tight tracking-tight text-zinc-950 dark:text-white">
              <div>Top reviews</div>
              <div
                className="mt-1 flex items-center justify-center gap-1 text-blue-700 dark:text-blue-300"
                aria-label="5 out of 5 stars"
              >
                <span aria-hidden="true">★</span>
                <span aria-hidden="true">★</span>
                <span aria-hidden="true">★</span>
                <span aria-hidden="true">★</span>
                <span aria-hidden="true">★</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-24 w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[1.5fr_2.5fr]">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 via-blue-600 to-indigo-600 text-white">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                    >
                      <path
                        d="M12 2L20 6V12C20 17 16.4 20.8 12 22C7.6 20.8 4 12V6L12 2Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    QuiloxLedger
                  </span>
                </div>

                <p className="mt-6 max-w-xs text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  Secure, self-custody wallet infrastructure. Build and connect
                  to Web3 with confidence. Trusted by teams worldwide.
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <a
                    href="#"
                    aria-label="X"
                    className="text-zinc-500 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="currentColor"
                    >
                      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.6l-5.2-6.5L5.6 22H2.5l7.3-8.4L1 2h6.8l4.7 6L18.9 2Zm-1.2 18h1.7L6.2 3.9H4.4L17.7 20Z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-label="GitHub"
                    className="text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.6 2.9 8.5 6.9 9.9.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.1-3.4-1.1-.4-1.1-1-1.4-1-1.4-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.3-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1.1.8-.2 1.6-.3 2.5-.3.8 0 1.7.1 2.5.3 2-1.4 2.8-1.1 2.8-1.1.5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7 1 .7 2.1v3.1c0 .3.2.6.7.5 4-1.4 6.9-5.3 6.9-9.9C22 6.6 17.5 2 12 2Z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-label="Discord"
                    className="text-zinc-500 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="currentColor"
                    >
                      <path d="M20.3 4.4a19.7 19.7 0 0 0-4.9-1.5l-.2.5c1.8.5 3.5 1.3 5.1 2.3a20 20 0 0 0-8.3-3.1 20 20 0 0 0-8.3 3.1 18 18 0 0 0 5.1-2.3l-.2-.5a19.7 19.7 0 0 0-4.9 1.5A19.7 19.7 0 0 0 1 12.8a20 20 0 0 0 5.5 8.1l1-1.3a14 14 0 0 1-3.4-2.6 16.6 16.6 0 0 0 17.8 0 14 14 0 0 1-3.4 2.6l1 1.3a20 20 0 0 0 5.5-8.1 19.7 19.7 0 0 0-2.7-8.4ZM8.5 15.5a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Zm7 0a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    Wallet
                  </h3>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li>
                      <a
                        href="/dashboard"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Mobile App
                      </a>
                    </li>
                    <li>
                      <a
                        href="/dashboard"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Browser Extension
                      </a>
                    </li>
                    <li>
                      <a
                        href="/receive"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Receive
                      </a>
                    </li>
                    <li>
                      <a
                        href="/send"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Send
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    Features
                  </h3>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li>
                      <a
                        href="#markets"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Markets
                      </a>
                    </li>
                    <li>
                      <a
                        href="#features"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Security
                      </a>
                    </li>
                    <li>
                      <a
                        href="#features"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Swaps
                      </a>
                    </li>
                    <li>
                      <a
                        href="#features"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Staking
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    Build
                  </h3>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li>
                      <a
                        href="/docs"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Developer Docs
                      </a>
                    </li>
                    <li>
                      <a
                        href="#build"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Wallet Core
                      </a>
                    </li>
                    <li>
                      <a
                        href="#build"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Submit dApp
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    Support
                  </h3>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li>
                      <a
                        href="#support"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a
                        href="#support"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="#about"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Privacy Policy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-16 flex flex-col items-center justify-between gap-8 border-t border-zinc-200 pt-8 dark:border-zinc-800 sm:flex-row">
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                © {new Date().getFullYear()} QuiloxLedger. All rights reserved.
                Built for the future of Web3.
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    ISO 27001
                  </span>
                  <div className="h-3 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-[10px] font-medium text-emerald-500">
                    Certified
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    ISO 27701
                  </span>
                  <div className="h-3 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-[10px] font-medium text-emerald-500">
                    Certified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>

        <div id="markets" className="sr-only" />
        <div id="features" className="sr-only" />
        <div id="build" className="sr-only" />
        <div id="support" className="sr-only" />
        <div id="about" className="sr-only" />
      </div>
    </>
  );
}
