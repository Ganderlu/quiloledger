export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:py-16">
      <div className="grid w-full flex-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col">
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-6xl">
            <span className="block">Own Your Crypto.</span>
            <span className="block">Be Your Future.</span>
            <span className="block">Gateway to Web3</span>
            <span className="block">Starts Here.</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
            Unlock the power of your cryptocurrency assets and explore the world
            of Web3 with QuiloxLedger.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-3 rounded-full border border-blue-500 px-5 py-3 text-left text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-white/10"
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
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600/80 dark:text-blue-300/80">
                  Download
                </span>
                <span className="text-sm font-semibold">Mobile App</span>
              </span>
            </a>

            <a
              href="/dashboard"
              className="group inline-flex items-center gap-3 rounded-full border border-blue-500 px-5 py-3 text-left text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-white/10"
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
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600/80 dark:text-blue-300/80">
                  Download
                </span>
                <span className="text-sm font-semibold">Extension</span>
              </span>
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative aspect-[4/3] w-full">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-emerald-500/10 blur-2xl dark:from-blue-500/20 dark:via-indigo-500/15 dark:to-emerald-500/15" />

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
                    <filter
                      id="qlx_shadow_light"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="18"
                        stdDeviation="18"
                        floodColor="#0b1220"
                        floodOpacity="0.28"
                      />
                    </filter>
                  </defs>

                  <path
                    d="M642 90C748 104 870 228 844 340C818 452 632 547 496 536C360 525 218 435 210 325C202 215 338 62 474 74C544 80 590 83 642 90Z"
                    fill="url(#qlx_g1_light)"
                    opacity="0.12"
                  />

                  <g filter="url(#qlx_shadow_light)">
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

                  <g filter="url(#qlx_shadow_light)">
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
                    <rect
                      x="334"
                      y="255"
                      width="155"
                      height="46"
                      rx="14"
                      fill="#f1f5f9"
                    />
                    <rect
                      x="334"
                      y="315"
                      width="155"
                      height="36"
                      rx="14"
                      fill="#f1f5f9"
                    />
                    <rect
                      x="334"
                      y="363"
                      width="155"
                      height="36"
                      rx="14"
                      fill="#f1f5f9"
                    />
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

                  <g filter="url(#qlx_shadow_light)">
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

                  <g filter="url(#qlx_shadow_light)">
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
                    <filter
                      id="qlx_shadow_dark"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="18"
                        stdDeviation="18"
                        floodColor="#000000"
                        floodOpacity="0.5"
                      />
                    </filter>
                  </defs>

                  <path
                    d="M642 90C748 104 870 228 844 340C818 452 632 547 496 536C360 525 218 435 210 325C202 215 338 62 474 74C544 80 590 83 642 90Z"
                    fill="url(#qlx_g1_dark)"
                    opacity="0.16"
                  />

                  <g filter="url(#qlx_shadow_dark)">
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

                  <g filter="url(#qlx_shadow_dark)">
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
                    <rect
                      x="334"
                      y="255"
                      width="155"
                      height="46"
                      rx="14"
                      fill="#111827"
                    />
                    <rect
                      x="334"
                      y="315"
                      width="155"
                      height="36"
                      rx="14"
                      fill="#111827"
                    />
                    <rect
                      x="334"
                      y="363"
                      width="155"
                      height="36"
                      rx="14"
                      fill="#111827"
                    />
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

                  <g filter="url(#qlx_shadow_dark)">
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

                  <g filter="url(#qlx_shadow_dark)">
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
                    <circle cx="756" cy="454" r="10" fill="url(#qlx_g1_dark)" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 w-full">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-950 px-6 py-10 text-white shadow-sm sm:px-10 lg:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />
          </div>

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Building on Trust
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
                We believe working together as a community creates a safer,
                better Web3 for everyone. QuiloxLedger enables blockchain
                developers to build dApps and wallets that connect with users,
                without worrying about low-level implementation details.
              </p>

              <a
                href="/docs"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-blue-800 shadow-sm hover:bg-white/90"
              >
                Check out our Developer Docs
              </a>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <svg
                viewBox="0 0 520 360"
                xmlns="http://www.w3.org/2000/svg"
                className="h-auto w-full"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="qlx_helmet_g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#34d399" />
                    <stop offset="0.5" stopColor="#60a5fa" />
                    <stop offset="1" stopColor="#a78bfa" />
                  </linearGradient>
                  <linearGradient
                    id="qlx_helmet_dark"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0" stopColor="#071433" />
                    <stop offset="1" stopColor="#020617" />
                  </linearGradient>
                </defs>

                <path
                  d="M362 70C411 86 446 122 456 175C466 228 445 279 402 309C359 339 304 348 256 338C208 328 164 299 141 253C118 207 117 150 142 112C167 74 224 49 280 50C314 50 339 58 362 70Z"
                  fill="url(#qlx_helmet_g)"
                  opacity="0.18"
                />

                <path
                  d="M307 66C357 72 392 109 392 165V286C392 306 376 322 356 322H266V88C266 76 276 66 288 66H307Z"
                  fill="url(#qlx_helmet_g)"
                />
                <path
                  d="M266 88V322H226C206 322 190 306 190 286V165C190 109 225 72 275 66"
                  fill="#22c55e"
                  opacity="0.55"
                />
                <path
                  d="M216 156C216 129 238 107 265 107H317C344 107 366 129 366 156V250C366 277 344 299 317 299H265C238 299 216 277 216 250V156Z"
                  fill="url(#qlx_helmet_dark)"
                />
                <path
                  d="M236 194H346"
                  stroke="#a7f3d0"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.35"
                />
                <text
                  x="238"
                  y="230"
                  fill="#86efac"
                  fontFamily={`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`}
                  fontSize="22"
                  fontWeight="700"
                >
                  00110011
                </text>
                <path
                  d="M266 88C270 78 280 72 290 72H302C312 72 322 78 326 88"
                  stroke="#0b1220"
                  strokeWidth="10"
                  strokeLinecap="round"
                  opacity="0.25"
                />
                <circle
                  cx="390"
                  cy="188"
                  r="22"
                  fill="#1d4ed8"
                  opacity="0.55"
                />
                <circle cx="390" cy="188" r="12" fill="#93c5fd" opacity="0.9" />
              </svg>
            </div>
          </div>
        </div>
      </div>

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
            <span className="text-blue-700 dark:text-blue-300">Certified</span>
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

      <section className="mt-16 w-full">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-amber-100 via-rose-100 to-fuchsia-200 px-6 py-12 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              Browse a world of dApps
            </h2>
            <p className="mt-4 text-pretty text-base leading-7 text-zinc-700 dark:text-zinc-300 sm:text-lg">
              Access Web3 and DeFi opportunities with the QuiloxLedger dApp browser.
            </p>
          </div>

          <div className="mt-10 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 sm:p-10">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <h3 className="text-balance text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                  Deposit crypto easily from exchanges
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:text-base sm:leading-7">
                  Take control of your crypto. Avoid complicated steps and deposit
                  directly to your wallet from exchanges like Binance and Coinbase.
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
                    <linearGradient id="qlx_phone_grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#60a5fa" />
                      <stop offset="0.5" stopColor="#a78bfa" />
                      <stop offset="1" stopColor="#34d399" />
                    </linearGradient>
                    <linearGradient id="qlx_hand_grad" x1="0" y1="0" x2="1" y2="1">
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
                    <rect x="80" y="62" width="148" height="22" rx="11" fill="#e2e8f0" />
                    <rect x="80" y="98" width="148" height="90" rx="16" fill="#e2e8f0" />
                    <rect x="110" y="110" width="88" height="66" rx="10" fill="#ffffff" />
                    <path
                      d="M120 120H188M120 134H188M120 148H188M120 162H188"
                      stroke="#0b1220"
                      strokeWidth="4"
                      opacity="0.25"
                    />
                    <rect x="80" y="208" width="148" height="24" rx="12" fill="#e2e8f0" />
                    <rect x="80" y="244" width="148" height="24" rx="12" fill="#e2e8f0" />
                    <rect x="80" y="280" width="148" height="24" rx="12" fill="#e2e8f0" />
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
                Get product updates, developer support, ecosystem news, and early
                access to new wallet features. Connect with builders and security
                researchers shaping the next generation of self-custody.
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

                <circle cx="260" cy="260" r="190" fill="url(#qlx_orb)" opacity="0.18" />
                <circle cx="260" cy="260" r="150" fill="url(#qlx_orb)" opacity="0.16" />
                <circle cx="260" cy="260" r="110" fill="url(#qlx_orb)" opacity="0.14" />

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
                <circle cx="260" cy="260" r="10" fill="#ffffff" opacity="0.9" />
                <circle cx="140" cy="260" r="7" fill="#ffffff" opacity="0.75" />
                <circle cx="380" cy="260" r="7" fill="#ffffff" opacity="0.75" />
                <circle cx="260" cy="140" r="7" fill="#ffffff" opacity="0.75" />
                <circle cx="260" cy="380" r="7" fill="#ffffff" opacity="0.75" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-16 w-full">
        <div className="overflow-hidden rounded-[2.25rem] border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
          <div className="mx-auto w-full px-6 py-12 sm:px-10 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[1.25fr_2fr] lg:gap-12">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-semibold tracking-tight text-emerald-500 dark:text-emerald-400">
                    QuiloxLedger
                  </span>
                </div>

                <div className="mt-6 flex items-start gap-6">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 160 190"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-28 w-24"
                  >
                    <defs>
                      <linearGradient id="qlx_footer_shield" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#34d399" />
                        <stop offset="0.55" stopColor="#2563eb" />
                        <stop offset="1" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M80 10L140 40V95C140 140 113 171 80 182C47 171 20 140 20 95V40L80 10Z"
                      fill="url(#qlx_footer_shield)"
                    />
                    <path
                      d="M80 10V182"
                      stroke="#0b1220"
                      strokeWidth="6"
                      opacity="0.22"
                    />
                  </svg>

                  <div className="max-w-sm">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                      Secure, self-custody wallet infrastructure.
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      Build and connect to Web3 with confidence. QuiloxLedger helps
                      teams ship wallet experiences that users trust.
                    </p>
                    <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <div>Support: support@quiloxledger.com</div>
                      <div className="mt-1">© {new Date().getFullYear()} QuiloxLedger</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 sm:gap-12 md:grid-cols-4">
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">Wallet</div>
                  <div className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="/dashboard">
                      Mobile App
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="/dashboard">
                      Browser Extension
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="/receive">
                      Receive
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="/send">
                      Send
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">Features</div>
                  <div className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="#markets">
                      Markets
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="#features">
                      Security
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="#features">
                      Swaps
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="#features">
                      Staking
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">Build</div>
                  <div className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="/docs">
                      Developer Docs
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="#build">
                      Wallet Core
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="#build">
                      Submit dApp
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="#build">
                      Get assets listed
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">Support</div>
                  <div className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="#support">
                      FAQ
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="#support">
                      Contact Us
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="#about">
                      Terms of Service
                    </a>
                    <a className="hover:text-zinc-950 dark:hover:text-white" href="#about">
                      Privacy Notice
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-8 border-t border-zinc-200 pt-8 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center justify-between gap-6">
                <div className="text-sm font-semibold text-zinc-950 dark:text-white">Stay Connected:</div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                  <a
                    href="#"
                    aria-label="QuiloxLedger on X"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.6l-5.2-6.5L5.6 22H2.5l7.3-8.4L1 2h6.8l4.7 6L18.9 2Zm-1.2 18h1.7L6.2 3.9H4.4L17.7 20Z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-label="QuiloxLedger on GitHub"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.6 2.9 8.5 6.9 9.9.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.1-3.4-1.1-.4-1.1-1-1.4-1-1.4-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.3-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1.1.8-.2 1.6-.3 2.5-.3.8 0 1.7.1 2.5.3 2-1.4 2.8-1.1 2.8-1.1.5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7 1 .7 2.1v3.1c0 .3.2.6.7.5 4-1.4 6.9-5.3 6.9-9.9C22 6.6 17.5 2 12 2Z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-label="QuiloxLedger on LinkedIn"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M20.45 20.45H17v-5.4c0-1.3 0-3-1.85-3s-2.1 1.4-2.1 2.9v5.5H9.6V9h3.3v1.6h.05c.46-.87 1.6-1.8 3.3-1.8 3.5 0 4.2 2.3 4.2 5.3v6.35ZM5.34 7.43a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM7.06 20.45H3.62V9h3.44v11.45Z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-label="QuiloxLedger on YouTube"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.3V8.7L16 12l-6 3.3Z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 [--qlx-badge-bg:#ffffff] [--qlx-badge-stroke:rgba(0,0,0,0.12)] [--qlx-badge-title:#0b1220] [--qlx-badge-sub:#475569] dark:border-white/10 dark:bg-white/5 dark:[--qlx-badge-bg:#0b1220] dark:[--qlx-badge-stroke:rgba(255,255,255,0.18)] dark:[--qlx-badge-title:#e5e7eb] dark:[--qlx-badge-sub:#9ca3af]">
                  <svg aria-hidden="true" viewBox="0 0 120 60" className="h-10 w-16">
                    <rect x="1" y="1" width="118" height="58" rx="10" fill="var(--qlx-badge-bg)" stroke="var(--qlx-badge-stroke)" />
                    <text x="60" y="25" textAnchor="middle" fill="var(--qlx-badge-title)" fontSize="10" fontWeight="700">
                      ISO 27001
                    </text>
                    <text x="60" y="43" textAnchor="middle" fill="var(--qlx-badge-sub)" fontSize="9">
                      Certified
                    </text>
                  </svg>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 [--qlx-badge-bg:#ffffff] [--qlx-badge-stroke:rgba(0,0,0,0.12)] [--qlx-badge-title:#0b1220] [--qlx-badge-sub:#475569] dark:border-white/10 dark:bg-white/5 dark:[--qlx-badge-bg:#0b1220] dark:[--qlx-badge-stroke:rgba(255,255,255,0.18)] dark:[--qlx-badge-title:#e5e7eb] dark:[--qlx-badge-sub:#9ca3af]">
                  <svg aria-hidden="true" viewBox="0 0 120 60" className="h-10 w-16">
                    <rect x="1" y="1" width="118" height="58" rx="10" fill="var(--qlx-badge-bg)" stroke="var(--qlx-badge-stroke)" />
                    <text x="60" y="25" textAnchor="middle" fill="var(--qlx-badge-title)" fontSize="10" fontWeight="700">
                      ISO 27701
                    </text>
                    <text x="60" y="43" textAnchor="middle" fill="var(--qlx-badge-sub)" fontSize="9">
                      Certified
                    </text>
                  </svg>
                </div>
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
  );
}
