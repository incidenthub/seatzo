import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, event } = location.state || {};
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!booking) {
      navigate("/", { replace: true });
      return;
    }
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => navigate("/", { replace: true });
    return () => {
      window.onpopstate = null;
    };
  }, []);

  const formatPrice = (p) => `₹${(p / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Extract seat numbers — handles both populated objects and raw IDs
  const seatNumbers =
    booking?.seats?.map((s) => s.seatNumber).filter(Boolean) || [];

  const qrData = JSON.stringify({
    bookingId: booking?._id,
    event: event?.title,
    seats: seatNumbers,
    amount: booking?.totalAmount,
  });

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [95, 210],
      });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`seatzo-${booking._id.slice(-6).toUpperCase()}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  if (!booking) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f4f5",
        fontFamily: "'DM Sans', sans-serif",
        padding: "48px 24px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=DM+Mono:wght@400;500&display=swap');

        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn  { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
        @keyframes spin   { to { transform:rotate(360deg); } }

        .su  { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .su1 { animation-delay: 0.05s; }
        .su2 { animation-delay: 0.12s; }
        .su3 { animation-delay: 0.2s; }
        .pop { animation: popIn 0.4s 0.2s cubic-bezier(0.34,1.56,0.64,1) both; }

        .ticket-shadow {
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 8px 16px rgba(0,0,0,0.06),
            0 24px 48px rgba(0,0,0,0.08);
        }

        .notch-left, .notch-right {
          position: absolute;
          width: 22px; height: 22px;
          background: #f4f4f5;
          border-radius: 50%;
          top: 50%; transform: translateY(-50%);
        }
        .notch-left  { left: -11px; }
        .notch-right { right: -11px; }

        .seat-pill {
          display: inline-flex; align-items: center;
          background: #f0eeff;
          border: 1.5px solid #c4b5fd;
          color: #6d28d9;
          font-family: 'DM Mono', monospace;
          font-size: 14px; font-weight: 500;
          padding: 5px 14px; border-radius: 100px;
        }

        .dl-btn {
          width: 100%; padding: 15px;
          background: #18181b; color: #fff;
          border: none; border-radius: 14px;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s, transform 0.15s;
        }
        .dl-btn:hover:not(:disabled) { background: #27272a; transform: translateY(-1px); }
        .dl-btn:disabled { background: #3f3f46; cursor: not-allowed; }

        .ghost-btn {
          flex: 1; text-align: center; text-decoration: none;
          padding: 13px; border-radius: 14px;
          font-size: 14px; font-weight: 500;
          color: #52525b;
          background: #fff;
          border: 1.5px solid #e4e4e7;
          transition: border-color 0.2s, color 0.2s;
        }
        .ghost-btn:hover { border-color: #a78bfa; color: #7c3aed; }
      `}</style>

      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        {/* Success badge */}
        <div
          className="su su1"
          style={{ textAlign: "center", marginBottom: 28 }}
        >
          <div
            className="pop"
            style={{
              width: 64,
              height: 64,
              background: "#18181b",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 26,
              fontWeight: 800,
              color: "#09090b",
              letterSpacing: -0.8,
              margin: "0 0 6px",
            }}
          >
            Booking confirmed!
          </h1>
          <p style={{ color: "#71717a", fontSize: 14, margin: 0 }}>
            Your ticket is ready. Download and carry it to the venue.
          </p>
        </div>

        {/* ── TICKET ── */}
        <div
          ref={ticketRef}
          className="su su2 ticket-shadow"
          style={{
            background: "#fff",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {/* Purple header band */}
          <div
            style={{
              background:
                "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)",
              padding: "28px 28px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                background: "rgba(255,255,255,0.08)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -40,
                left: 20,
                width: 80,
                height: 80,
                background: "rgba(255,255,255,0.05)",
                borderRadius: "50%",
              }}
            />

            {/* Brand */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: -0.3,
                }}
              >
                Seatzo
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 100,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                {event?.category || "Event"}
              </div>
            </div>

            {/* Event title */}
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: -0.5,
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              {event?.title}
            </div>

            {/* Date / Time / Venue row */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { icon: "📅", label: formatDate(event?.date) },
                { icon: "🕐", label: formatTime(event?.date) },
                { icon: "📍", label: event?.venue },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <span style={{ fontSize: 12 }}>{icon}</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.85)",
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Perforated divider */}
          <div style={{ position: "relative", height: 0, overflow: "visible" }}>
            <div className="notch-left" />
            <div className="notch-right" />
            <div
              style={{
                borderTop: "2px dashed #e4e4e7",
                margin: "0 12px",
              }}
            />
          </div>

          {/* Main body */}
          <div style={{ padding: "24px 28px" }}>
            {/* Seat numbers */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#a1a1aa",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                Your Seats
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {seatNumbers.length > 0 ? (
                  seatNumbers.map((sn) => (
                    <span key={sn} className="seat-pill">
                      {sn}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "#a1a1aa", fontSize: 13 }}>
                    Seat details loading...
                  </span>
                )}
              </div>
            </div>

            {/* Info row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 24px",
                marginBottom: 24,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#a1a1aa",
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Amount Paid
                </div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#09090b",
                  }}
                >
                  {formatPrice(booking.totalAmount)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#a1a1aa",
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background:
                      booking.status === "CONFIRMED" ? "#f0fdf4" : "#fffbeb",
                    border: `1px solid ${booking.status === "CONFIRMED" ? "#bbf7d0" : "#fde68a"}`,
                    color:
                      booking.status === "CONFIRMED" ? "#16a34a" : "#d97706",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 100,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background:
                        booking.status === "CONFIRMED" ? "#16a34a" : "#d97706",
                    }}
                  />
                  {booking.status === "CONFIRMED" ? "Confirmed" : "Pending"}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#a1a1aa",
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  City
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#18181b",
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {event?.city}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#a1a1aa",
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Ref No.
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    color: "#18181b",
                    fontWeight: 500,
                  }}
                >
                  #{booking._id?.slice(-8).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{ borderTop: "1.5px solid #f4f4f5", marginBottom: 20 }}
            />

            {/* QR + note */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  background: "#fff",
                  border: "1.5px solid #e4e4e7",
                  borderRadius: 14,
                  padding: 10,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  flexShrink: 0,
                }}
              >
                <QRCodeSVG
                  value={qrData}
                  size={90}
                  bgColor="#ffffff"
                  fgColor="#18181b"
                  level="M"
                />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#09090b",
                    marginBottom: 6,
                  }}
                >
                  Scan at entry
                </div>
                <div
                  style={{ fontSize: 12, color: "#71717a", lineHeight: 1.6 }}
                >
                  Show this QR code at the venue gate. One scan per ticket.
                </div>
              </div>
            </div>
          </div>

          {/* Footer strip */}
          <div
            style={{
              background: "#fafafa",
              borderTop: "1px solid #f4f4f5",
              padding: "12px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 10, color: "#d4d4d8", letterSpacing: 0.5 }}>
              Powered by Stripe · © 2026 Seatzo
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: i < 5 ? "#7c3aed" : "#e4e4e7",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="su su3"
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <button
            className="dl-btn"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Generating PDF...
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download Ticket as PDF
              </>
            )}
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/dashboard" className="ghost-btn">
              My Bookings
            </Link>
            <Link to="/events" className="ghost-btn">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
