import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#09090b",
        color: "#a1a1aa",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .lp-hero-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; }
        .lp-orb1 { width: 600px; height: 600px; background: #7c3aed; top: -100px; left: -100px; animation: lpFloat 8s ease-in-out infinite; }
        .lp-orb2 { width: 400px; height: 400px; background: #a855f7; bottom: -50px; right: -50px; animation: lpFloat 8s ease-in-out 3s infinite; }
        .lp-orb3 { width: 300px; height: 300px; background: #f59e0b; top: 50%; left: 50%; transform: translate(-50%,-50%); opacity: 0.06; animation: lpFloat 8s ease-in-out 1.5s infinite; }

        .lp-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px); background-size: 60px 60px; }

        .lp-badge-dot { width: 6px; height: 6px; background: #c084fc; border-radius: 50%; animation: lpPulse 2s infinite; }

        .lp-gradient-text { background: linear-gradient(135deg, #a855f7, #c084fc, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .lp-btn-primary { background: #7c3aed; color: #fff; padding: 16px 36px; border-radius: 12px; font-size: 15px; font-weight: 600; border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 0 40px rgba(124,58,237,0.3); font-family: 'DM Sans', sans-serif; text-decoration: none; display: inline-block; }
        .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 60px rgba(124,58,237,0.4); background: #a855f7; }

        .lp-btn-ghost { color: #a1a1aa; padding: 16px 28px; border-radius: 12px; font-size: 15px; border: 1px solid rgba(255,255,255,0.07); cursor: pointer; background: transparent; transition: border-color 0.2s, color 0.2s; font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center; gap: 8px; }
        .lp-btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: #fafafa; }

        .lp-feature-card { background: #111113; padding: 40px 36px; transition: background 0.3s; position: relative; overflow: hidden; }
        .lp-feature-card:hover { background: #18181b; }
        .lp-feature-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(124,58,237,0.05), transparent); opacity: 0; transition: opacity 0.3s; }
        .lp-feature-card:hover::before { opacity: 1; }

        .lp-pricing-card { background: #111113; border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 36px; position: relative; transition: transform 0.3s, border-color 0.3s; }
        .lp-pricing-card:hover { transform: translateY(-4px); border-color: rgba(124,58,237,0.3); }
        .lp-pricing-featured { background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.08)); border-color: rgba(124,58,237,0.4) !important; }

        .lp-seat { width: 32px; height: 28px; border-radius: 6px 6px 4px 4px; border: 1px solid transparent; transition: transform 0.15s; cursor: pointer; display: inline-block; }
        .lp-seat:hover { transform: scale(1.15); }
        .lp-seat-available { background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.3); }
        .lp-seat-booked { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.2); cursor: default; }
        .lp-seat-selected { background: #7c3aed; border-color: #a855f7; }
        .lp-seat-premium { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.3); }

        .lp-plan-btn { width: 100%; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.07); background: #18181b; color: #fafafa; }
        .lp-plan-btn:hover { border-color: rgba(124,58,237,0.4); color: #c084fc; }
        .lp-plan-btn-primary { background: #7c3aed !important; border-color: #7c3aed !important; color: #fff !important; }
        .lp-plan-btn-primary:hover { background: #a855f7 !important; border-color: #a855f7 !important; }

        @keyframes lpFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
        @keyframes lpPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes lpFadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

        .lp-anim-1 { animation: lpFadeUp 0.7s 0.2s ease both; }
        .lp-anim-2 { animation: lpFadeUp 0.7s 0.35s ease both; }
        .lp-anim-3 { animation: lpFadeUp 0.7s 0.5s ease both; }
        .lp-anim-4 { animation: lpFadeUp 0.7s 0.65s ease both; }
        .lp-anim-5 { animation: lpFadeUp 0.7s 0.8s ease both; }
      `}</style>

      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <div className="lp-grid" />
          <div className="lp-hero-orb lp-orb1" />
          <div className="lp-hero-orb lp-orb2" />
          <div className="lp-hero-orb lp-orb3" />
        </div>

        <div
          className="lp-anim-1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#c084fc",
            padding: "6px 16px",
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 32,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="lp-badge-dot" />
          Now with real-time seat locking
        </div>

        <h1
          className="lp-anim-2"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(48px, 7vw, 88px)",
            fontWeight: 800,
            lineHeight: 1.02,
            color: "#fafafa",
            letterSpacing: -2,
            maxWidth: 900,
            margin: "0 auto 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          The smarter way to
          <br />
          <span className="lp-gradient-text">book tickets</span>
        </h1>

        <p
          className="lp-anim-3"
          style={{
            fontSize: 18,
            color: "#a1a1aa",
            maxWidth: 520,
            lineHeight: 1.7,
            margin: "0 auto 48px",
            position: "relative",
            zIndex: 1,
          }}
        >
          Real-time seat locking, dynamic pricing, and instant confirmations.
          Built for concerts, sports, movies, and everything in between.
        </p>

        <div
          className="lp-anim-4"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "relative",
            zIndex: 1,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link to="/events" className="lp-btn-primary">
            Browse Events →
          </Link>
          <Link to="/register" className="lp-btn-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Get Started Free
          </Link>
        </div>

        {/* Stats */}
        <div
          className="lp-anim-5"
          style={{
            display: "flex",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "#111113",
            borderRadius: 16,
            overflow: "hidden",
            maxWidth: 700,
            margin: "80px auto 0",
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          {[
            { num: "500K+", label: "Tickets Sold" },
            { num: "2,400+", label: "Events Listed" },
            { num: "99.9%", label: "Uptime" },
            { num: "0", label: "Double Bookings" },
          ].map((s, i, arr) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                padding: "28px 24px",
                textAlign: "center",
                borderRight:
                  i < arr.length - 1
                    ? "1px solid rgba(255,255,255,0.07)"
                    : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#fafafa",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {s.num}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#a1a1aa",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }}
      >
        <span
          style={{
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#c084fc",
            fontWeight: 600,
            display: "block",
            marginBottom: 16,
          }}
        >
          Why TicketFlow
        </span>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800,
            color: "#fafafa",
            letterSpacing: -1.5,
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Built different.
          <br />
          Built better.
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "#a1a1aa",
            maxWidth: 480,
            lineHeight: 1.7,
          }}
        >
          We solve the hard problems — race conditions, surge pricing, and
          payment reliability — so you never have to worry.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 1,
            background: "rgba(255,255,255,0.07)",
            borderRadius: 20,
            overflow: "hidden",
            marginTop: 64,
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {[
            {
              icon: "🔒",
              title: "Atomic Seat Locking",
              desc: "Redis-powered SETNX ensures only one person can hold a seat at a time. Zero race conditions, zero double bookings.",
            },
            {
              icon: "📈",
              title: "Dynamic Pricing",
              desc: "Real-time multipliers based on demand, availability, and time. Prices update live as the crowd grows.",
            },
            {
              icon: "⚡",
              title: "Instant Confirmation",
              desc: "Stripe webhooks confirm bookings the moment payment clears. No waiting, no manual checks.",
            },
            {
              icon: "🛡️",
              title: "Idempotent Payments",
              desc: "UUID idempotency keys prevent double charges on retries. Your money is always safe.",
            },
            {
              icon: "🎫",
              title: "QR Code Tickets",
              desc: "Every confirmed booking generates a unique QR code. Entry at the gate — no printing required.",
            },
            {
              icon: "📊",
              title: "Organiser Analytics",
              desc: "Revenue, occupancy, and booking trends in real time. Know your event before it ends.",
            },
          ].map((f) => (
            <div key={f.title} className="lp-feature-card">
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 20,
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fafafa",
                  marginBottom: 10,
                }}
              >
                {f.title}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: "#a1a1aa" }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEAT DEMO */}
      <section
        style={{ padding: "0 48px 120px", maxWidth: 1200, margin: "0 auto" }}
      >
        <span
          style={{
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#c084fc",
            fontWeight: 600,
            display: "block",
            marginBottom: 16,
          }}
        >
          Interactive
        </span>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800,
            color: "#fafafa",
            letterSpacing: -1.5,
            marginBottom: 16,
          }}
        >
          Pick your perfect seat.
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "#a1a1aa",
            maxWidth: 480,
            lineHeight: 1.7,
          }}
        >
          A live seat map that updates in real time. Click to select. Locks in
          300ms.
        </p>

        <div
          style={{
            background: "#111113",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 24,
            padding: 48,
            textAlign: "center",
            marginTop: 64,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              color: "rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "6px 24px",
              borderRadius: 100,
              display: "inline-block",
              marginBottom: 32,
            }}
          >
            STAGE
          </div>

          {[
            [
              "premium",
              "premium",
              "selected",
              "selected",
              "premium",
              "premium",
              "premium",
              "premium",
            ],
            [
              "available",
              "available",
              "booked",
              "booked",
              "available",
              "available",
              "available",
              "booked",
              "available",
              "available",
            ],
            [
              "available",
              "booked",
              "available",
              "available",
              "available",
              "booked",
              "booked",
              "available",
              "available",
              "available",
              "available",
            ],
            [
              "available",
              "available",
              "available",
              "booked",
              "available",
              "available",
              "booked",
              "available",
              "available",
              "available",
              "available",
              "booked",
            ],
          ].map((row, ri) => (
            <div
              key={ri}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 6,
                marginTop: 8,
              }}
            >
              {row.map((type, si) => (
                <div key={si} className={`lp-seat lp-seat-${type}`} />
              ))}
            </div>
          ))}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            {[
              {
                label: "Premium",
                bg: "rgba(245,158,11,0.3)",
                border: "1px solid rgba(245,158,11,0.4)",
              },
              { label: "Selected", bg: "#7c3aed", border: "none" },
              {
                label: "Available",
                bg: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.3)",
              },
              {
                label: "Booked",
                bg: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.2)",
              },
            ].map((l) => (
              <div
                key={l.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: l.bg,
                    border: l.border,
                  }}
                />
                <span style={{ color: "#a1a1aa" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        style={{ padding: "0 48px 120px", maxWidth: 1200, margin: "0 auto" }}
      >
        <span
          style={{
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#c084fc",
            fontWeight: 600,
            display: "block",
            marginBottom: 16,
          }}
        >
          Process
        </span>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800,
            color: "#fafafa",
            letterSpacing: -1.5,
            marginBottom: 64,
          }}
        >
          From browse to gate
          <br />
          in four steps.
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 32,
          }}
        >
          {[
            {
              num: "01",
              title: "Browse Events",
              desc: "Filter by city, category, date or price. Find exactly what you're looking for.",
            },
            {
              num: "02",
              title: "Lock Your Seats",
              desc: "Click your seats. They're locked for 5 minutes — just for you.",
            },
            {
              num: "03",
              title: "Pay Securely",
              desc: "Stripe-powered checkout with idempotency protection. No double charges, ever.",
            },
            {
              num: "04",
              title: "Show Your QR",
              desc: "Your ticket arrives instantly. Scan at the gate and you're in.",
            },
          ].map((s) => (
            <div key={s.num}>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 56,
                  fontWeight: 800,
                  color: "rgba(124,58,237,0.12)",
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fafafa",
                  marginBottom: 8,
                }}
              >
                {s.title}
              </div>
              <div style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        style={{ padding: "0 48px 120px", maxWidth: 1200, margin: "0 auto" }}
      >
        <span
          style={{
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#c084fc",
            fontWeight: 600,
            display: "block",
            marginBottom: 16,
          }}
        >
          Pricing
        </span>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800,
            color: "#fafafa",
            letterSpacing: -1.5,
            marginBottom: 16,
          }}
        >
          Simple, honest pricing.
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "#a1a1aa",
            maxWidth: 480,
            lineHeight: 1.7,
            marginBottom: 64,
          }}
        >
          No hidden fees. No surprise charges. Just straightforward ticketing.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              name: "Customer",
              price: "0",
              desc: "Free forever for event-goers",
              featured: false,
              features: [
                "Browse all events",
                "Real-time seat map",
                "Instant QR tickets",
                "Booking history",
              ],
            },
            {
              name: "Organiser",
              price: "999",
              desc: "For event creators and venues",
              featured: true,
              features: [
                "Unlimited events",
                "Dynamic pricing engine",
                "Revenue analytics",
                "Seat section management",
                "Stripe payouts",
              ],
            },
            {
              name: "Enterprise",
              price: null,
              desc: "For large venues and platforms",
              featured: false,
              features: [
                "Everything in Organiser",
                "White-label solution",
                "Dedicated Redis cluster",
                "SLA guarantee",
                "Priority support",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`lp-pricing-card ${plan.featured ? "lp-pricing-featured" : ""}`}
              style={{ position: "relative" }}
            >
              {plan.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#7c3aed",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 16px",
                    borderRadius: 100,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Most Popular
                </div>
              )}
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#a1a1aa",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 16,
                }}
              >
                {plan.name}
              </div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: plan.price ? 48 : 36,
                  fontWeight: 800,
                  color: "#fafafa",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {plan.price ? (
                  <>
                    <sup
                      style={{
                        fontSize: 20,
                        verticalAlign: "top",
                        marginTop: 12,
                        display: "inline-block",
                      }}
                    >
                      ₹
                    </sup>
                    {plan.price}
                    {plan.price !== "0" && (
                      <span style={{ fontSize: 18, color: "#a1a1aa" }}>
                        /mo
                      </span>
                    )}
                  </>
                ) : (
                  "Custom"
                )}
              </div>
              <div style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 28 }}>
                {plan.desc}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 32,
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: 14,
                      color: "#a1a1aa",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ color: "#c084fc", fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`lp-plan-btn ${plan.featured ? "lp-plan-btn-primary" : ""}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  textDecoration: "none",
                  padding: "12px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: plan.featured ? "#7c3aed" : "#18181b",
                  color: plan.featured ? "#fff" : "#fafafa",
                  transition: "all 0.2s",
                }}
              >
                {plan.price === "0"
                  ? "Get Started"
                  : plan.price
                    ? "Start Free Trial"
                    : "Contact Sales"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div
        style={{
          margin: "0 48px 120px",
          padding: 80,
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.1))",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: 28,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            background: "#7c3aed",
            borderRadius: "50%",
            filter: "blur(100px)",
            opacity: 0.1,
            top: -100,
            left: -100,
          }}
        />
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 48,
            fontWeight: 800,
            color: "#fafafa",
            letterSpacing: -1.5,
            marginBottom: 16,
            position: "relative",
            zIndex: 1,
          }}
        >
          Ready to sell your
          <br />
          first ticket?
        </h2>
        <p
          style={{
            color: "#a1a1aa",
            fontSize: 16,
            marginBottom: 40,
            position: "relative",
            zIndex: 1,
          }}
        >
          Join thousands of organisers already using TicketFlow.
        </p>
        <Link
          to="/register"
          className="lp-btn-primary"
          style={{ position: "relative", zIndex: 1 }}
        >
          Create Your Event →
        </Link>
      </div>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "40px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 18,
            fontWeight: 800,
            color: "#fafafa",
          }}
        >
          Ticket<span style={{ color: "#c084fc" }}>Flow</span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {["Features", "Pricing", "Events", "Dashboard"].map((l) => (
            <Link
              key={l}
              to="/"
              style={{
                color: "#a1a1aa",
                textDecoration: "none",
                fontSize: 13,
                transition: "color 0.2s",
              }}
            >
              {l}
            </Link>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "rgba(161,161,170,0.5)" }}>
          © 2026 TicketFlow. Built with MERN + Redis + Stripe.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
