import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "../utils/axios";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const stripePromise = loadStripe(
  "pk_test_51THgvH9YIA9s0fO1sxZWdXJmqqDI3gX3FcuQBiVFz4RgSPMjR8ugjhe26Rv7BdTty1AIxuZJogqFk6rGxLJqH47800ZzJAvqqI",
);

const CARD_STYLE = {
  style: {
    base: {
      color: "#fafafa",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "15px",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#52525b" },
    },
    invalid: { color: "#f87171", iconColor: "#f87171" },
  },
};

// ─── Inner form (must be inside <Elements>) ───────────────────────────────────
const CheckoutForm = ({ booking, event, selectedSeats, pricing, eventId, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState("");

  const formatPrice = (paise) =>
    `₹${(Number(paise) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const seatTotal = pricing ? pricing.price * selectedSeats.length : 0;
  const fees = Math.round(seatTotal * 0.12);
  const grandTotal = seatTotal + fees;
  const grandTotalInPaise = Math.round(grandTotal);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setCardError("");

    try {
      // Step 1 — create payment intent
      const idempotencyKey = uuidv4();
      const { data } = await api.post("/payments/create", {
        bookingId: booking._id,
        idempotencyKey,
        amount: grandTotalInPaise,
      });

      const { clientSecret } = data.data;

      // Step 2 — confirm card with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: elements.getElement(CardElement) } },
      );

      if (error) {
        setCardError(error.message);
        toast.error(error.message);
        // Release locks only on payment failure
        await api
          .post("/seats/release", {
            eventId,
            seatIds: selectedSeats.map((s) => s._id),
          })
          .catch(() => {});
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // Step 3 — confirm booking on backend
        const confirmRes = await api.post(`/bookings/${booking._id}/confirm`, {
          paymentIntentId: paymentIntent.id,
        });

        const confirmedBooking = confirmRes.data.data;

        if (confirmedBooking.status !== "CONFIRMED") {
          throw new Error("Booking confirmation failed — please contact support.");
        }

        // FIX: signal parent that payment succeeded BEFORE navigating,
        // so the cleanup useEffect knows NOT to release the seats.
        onPaymentSuccess();

        toast.success("Payment successful! Booking confirmed 🎉");
        navigate("/booking-confirmation", {
          state: { booking: confirmedBooking, event },
          replace: true,
        });
      }
    } catch (err) {
      const errorData = err.response?.data?.error;
      const message =
        typeof errorData === "string"
          ? errorData
          : errorData?.message ||
            err.message ||
            "Payment failed. Please try again.";
      toast.error(message);
      setCardError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      {/* Event summary */}
      <div
        style={{
          background: "#111113",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: 24,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#71717a",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          Event
        </div>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#fafafa",
            marginBottom: 4,
          }}
        >
          {event?.title}
        </div>
        <div style={{ fontSize: 13, color: "#71717a" }}>
          {event?.venue} · {event?.city}
        </div>
      </div>

      {/* Seats */}
      <div
        style={{
          background: "#111113",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: 24,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#71717a",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          Selected Seats
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {selectedSeats.map((seat) => (
            <div
              key={seat.seatNumber}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
              }}
            >
              <span style={{ color: "#fafafa" }}>
                {seat.seatNumber} — {seat.section}
              </span>
              <span style={{ color: "#71717a" }}>
                {formatPrice(pricing?.price ?? seat.price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Price breakdown */}
      <div
        style={{
          background: "#111113",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#71717a",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          Price Breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <span style={{ color: "#71717a" }}>
              Subtotal ({selectedSeats.length} seat
              {selectedSeats.length > 1 ? "s" : ""})
            </span>
            <span style={{ color: "#fafafa" }}>{formatPrice(seatTotal)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <span style={{ color: "#71717a" }}>Convenience fee (12%)</span>
            <span style={{ color: "#fafafa" }}>{formatPrice(fees)}</span>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              paddingTop: 12,
              marginTop: 4,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#fafafa", fontWeight: 600 }}>Total</span>
            <span
              style={{
                color: "#c084fc",
                fontFamily: "'Syne', sans-serif",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {formatPrice(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Card input */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 12,
            color: "#71717a",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          Card Details
        </div>
        <div
          style={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <CardElement options={CARD_STYLE} />
        </div>
        {cardError && (
          <div style={{ color: "#f87171", fontSize: 13, marginTop: 10 }}>
            {cardError}
          </div>
        )}

        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 8,
            fontSize: 12,
            color: "#d97706",
          }}
        >
          🧪 Test card: <strong>4242 4242 4242 4242</strong> · Any future date · Any CVC
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 12,
          background: loading ? "#4c1d95" : "#7c3aed",
          color: "#fff",
          fontFamily: "'Syne', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          boxShadow: "0 0 40px rgba(124,58,237,0.3)",
          letterSpacing: -0.3,
        }}
      >
        {loading ? "Processing payment..." : `Pay ${formatPrice(grandTotal)}`}
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginTop: 16,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#52525b">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span style={{ fontSize: 12, color: "#52525b" }}>
          Secured by Stripe. Your card details are never stored.
        </span>
      </div>
    </form>
  );
};

// ─── Outer wrapper ────────────────────────────────────────────────────────────
const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    eventId,
    event,
    selectedSeats,
    pricing,
    idempotencyKey: stateIdempotencyKey,
  } = location.state || {};

  const [booking, setBooking] = useState(null);
  const [creatingBooking, setCreatingBooking] = useState(true);
  const [countdown, setCountdown] = useState(300);

  // FIX: track whether payment completed so we don't release locks on successful checkout
  const paymentSucceeded = useRef(false);

  useEffect(() => {
    if (!eventId || !selectedSeats?.length) {
      navigate("/");
      return;
    }
    createBooking();
  }, []);

  // Countdown timer + auto-release on expiry
  useEffect(() => {
    if (!creatingBooking) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            releaseAllSeats();
            toast.error("Seat lock expired. Please re-select your seats.");
            navigate(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [creatingBooking]);

  // Release seats ONLY if payment did NOT succeed (back button, tab close, expiry)
  // FIX: guard with paymentSucceeded ref so successful navigation doesn't wipe locks
  // before/during the backend confirm call finishing up.
  useEffect(() => {
    return () => {
      if (!paymentSucceeded.current) {
        releaseAllSeats();
      }
    };
  }, []);

  const releaseAllSeats = async () => {
    if (!eventId) return;
    try {
      await api.post("/seats/release-all", { eventId }).catch(() => {});
    } catch (err) {
      // Silent fail — seats auto-release after 5 min TTL anyway
    }
  };

  const createBooking = async () => {
    try {
      const finalIdempotencyKey = stateIdempotencyKey || uuidv4();
      const res = await api.post("/bookings", {
        eventId,
        seatIds: selectedSeats.map((s) => s._id),
        idempotencyKey: finalIdempotencyKey,
      });
      setBooking(res.data.data);
    } catch (err) {
      const errorMsg =
        typeof err.response?.data?.error === "string"
          ? err.response?.data?.error
          : err.response?.data?.error?.message ||
            err.message ||
            "Could not create booking";
      toast.error(errorMsg);
      navigate(-1);
    } finally {
      setCreatingBooking(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (creatingBooking)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#09090b",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "2px solid #7c3aed",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#71717a", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
          Creating your booking...
        </p>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090b",
        fontFamily: "'DM Sans', sans-serif",
        padding: "48px 24px",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 28,
                fontWeight: 800,
                color: "#fafafa",
                letterSpacing: -1,
                margin: 0,
              }}
            >
              Complete Payment
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: countdown < 60 ? "rgba(239,68,68,0.1)" : "rgba(124,58,237,0.1)",
                border: `1px solid ${countdown < 60 ? "rgba(239,68,68,0.3)" : "rgba(124,58,237,0.3)"}`,
                color: countdown < 60 ? "#f87171" : "#c084fc",
                padding: "6px 14px",
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Syne', sans-serif",
              }}
            >
              ⏱ {formatTime(countdown)}
            </div>
          </div>
          <p style={{ color: "#71717a", fontSize: 14, margin: 0 }}>
            Your seats are held. Complete payment before the timer runs out.
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm
            booking={booking}
            event={event}
            selectedSeats={selectedSeats}
            pricing={pricing}
            eventId={eventId}
            onPaymentSuccess={() => { paymentSucceeded.current = true; }}
          />
        </Elements>
      </div>
    </div>
  );
};

export default Checkout;