const Contact = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 px-4 py-20">

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-black tracking-[0.25em] uppercase text-rose-500 mb-4">
            Support
          </p>

          <h1
            className="text-5xl sm:text-6xl font-black tracking-tight text-neutral-900 dark:text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Contact Seatzo
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-sm sm:text-base leading-7 text-neutral-500 dark:text-neutral-400">
            Need help with bookings, payments, refunds, or account issues?
            Reach out to our support team through any of the channels below.
          </p>
        </div>

        {/* Main Card */}
        <div className="relative overflow-hidden rounded-[32px] border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.03]">

          {/* Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.18),transparent_30%)] pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2">

            {/* Left */}
            <div className="p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-white/5">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold tracking-wide mb-8">
                Customer Support
              </div>

              <h2 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
                We’re here to help.
              </h2>

              <p className="mt-5 text-sm leading-7 text-neutral-500 dark:text-neutral-400 max-w-md">
                Whether it’s a booking issue, refund request, or technical problem,
                our team is ready to assist you quickly and efficiently.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <div className="px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Fast Responses
                </div>

                <div className="px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Refund Support
                </div>

                <div className="px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Secure Assistance
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="p-8 sm:p-12 flex flex-col gap-5">

              {/* Email */}
              <a
                href="mailto:support@seatzo.com"
                className="group rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-5 hover:border-rose-500/30 hover:bg-rose-500/[0.03] transition-all duration-300"
              >
                <div className="flex items-start justify-between">

                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-16 10h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-2">
                        Email
                      </p>

                      <p className="text-base font-bold text-neutral-900 dark:text-white">
                        support@seatzo.com
                      </p>

                      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                        Best for bookings, refunds, and support requests.
                      </p>
                    </div>
                  </div>

                  <svg
                    className="w-5 h-5 text-neutral-300 dark:text-neutral-700 group-hover:text-rose-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 17L17 7M7 7h10v10"
                    />
                  </svg>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+919876543210"
                className="group rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-5 hover:border-rose-500/30 hover:bg-rose-500/[0.03] transition-all duration-300"
              >
                <div className="flex items-start justify-between">

                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a2 2 0 011.9 1.37l1.14 3.43a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006.59 6.59l1.27-1.27a2 2 0 012.11-.45l3.43 1.14A2 2 0 0121 15.72V19a2 2 0 01-2 2h-1C9.16 21 3 14.84 3 7V5z"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-2">
                        Phone
                      </p>

                      <p className="text-base font-bold text-neutral-900 dark:text-white">
                        +91 98765 43210
                      </p>

                      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                        Monday — Saturday, 9 AM to 7 PM IST.
                      </p>
                    </div>
                  </div>

                  <svg
                    className="w-5 h-5 text-neutral-300 dark:text-neutral-700 group-hover:text-rose-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 17L17 7M7 7h10v10"
                    />
                  </svg>
                </div>
              </a>

              {/* Office */}
              <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-5">
                <div className="flex gap-4">

                  <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657A8 8 0 1117.657 16.657z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-2">
                      Office
                    </p>

                    <p className="text-base font-bold text-neutral-900 dark:text-white">
                      Seatzo Entertainment Pvt. Ltd.
                    </p>

                    <p className="mt-2 text-sm leading-7 text-neutral-500 dark:text-neutral-400">
                      Kozhikode, Kerala, India
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 tracking-wide">
            Average response time: under 24 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;