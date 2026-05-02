import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../utils/axios";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const stripePromise = loadStripe("pk_test_51THgvH9YIA9s0fO1sxZWdXJmqqDI3gX3FcuQBiVFz4RgSPMjR8ugjhe26Rv7BdTty1AIxuZJogqFk6rGxLJqH47800ZzJAvqqI");

const CARD_STYLE = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "15px",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#525252" },
    },
    invalid: { color: "#f87171", iconColor: "#f87171" },
  },
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-100/80 dark:bg-neutral-900/60 border border-gray-200 dark:border-white/5 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4">{children}</p>
);

const CheckoutForm = ({ booking, event, selectedSeats, pricing, eventId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState("");

  const formatPrice = (paise) => `₹${(Number(paise) / 100).toLocaleString("en-IN")}`;

  const seatTotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
  const fees = Math.round(seatTotal * 0.12);
  const grandTotal = seatTotal + fees;
  const grandTotalInPaise = Math.round(grandTotal);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setCardError("");
    try {
      const idempotencyKey = uuidv4();
      const { data } = await api.post("/payments/create", { bookingId: booking._id, idempotencyKey, amount: grandTotalInPaise });
      const { clientSecret } = data.data;
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: elements.getElement(CardElement) } });
      if (error) { setCardError(error.message); toast.error(error.message); setLoading(false); return; }
      if (paymentIntent.status === "succeeded") {
        const confirmRes = await api.post(`/bookings/${booking._id}/confirm`, { paymentIntentId: paymentIntent.id });
        toast.success("Payment successful! Booking confirmed 🎉");
        navigate("/booking-confirmation", { state: { booking: confirmRes.data.data, event }, replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      {/* Event */}
      <Card>
        <SectionLabel>Event Details</SectionLabel>
        <div className="flex gap-4 items-center">
          <div className="w-14 h-20 rounded-xl overflow-hidden shrink-0 border border-white/8">
            <img src={event?.posterUrl || "https://images.unsplash.com/photo-1514525253344-9914f25af042?auto=format&fit=crop&w=400&q=80"} className="w-full h-full object-cover" alt={event?.title} />
          </div>
          <div>
            <p className="font-black text-gray-900 dark:text-white text-base leading-tight mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{event?.title}</p>
            <p className="text-gray-400 dark:text-neutral-500 text-xs">{event?.venue} · {event?.city}</p>
            {event?.date && <p className="text-gray-400 dark:text-neutral-600 text-xs mt-1">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
          </div>
        </div>
      </Card>

      {/* Seats */}
      <Card>
        <SectionLabel>Selected Seats</SectionLabel>
        <div className="space-y-2">
          {selectedSeats.map((seat) => (
            <div key={seat._id} className="flex justify-between items-center bg-gray-200/60 dark:bg-neutral-800/60 border border-gray-300/50 dark:border-white/5 p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Seat {seat.seatNumber}</p>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-600 uppercase tracking-wider font-bold">{seat.section}</p>
                </div>
              </div>
              <span className="text-sm font-black text-rose-400">{formatPrice(seat.price)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Order Summary */}
      <Card>
        <SectionLabel>Order Summary</SectionLabel>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500 dark:text-neutral-400">
            <span>Ticket Subtotal</span>
            <span className="font-semibold text-gray-700 dark:text-neutral-300">{formatPrice(seatTotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-neutral-400">
            <span>Convenience Fees (12%)</span>
            <span className="font-semibold text-gray-700 dark:text-neutral-300">{formatPrice(fees)}</span>
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-between items-end">
            <span className="text-sm font-bold text-gray-500 dark:text-neutral-400">Total Amount</span>
            <span className="text-3xl font-black text-gray-900 dark:text-white leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </Card>

      {/* Payment */}
      <Card>
        <SectionLabel>Payment Details</SectionLabel>
        <div className="bg-gray-200/80 dark:bg-neutral-800/80 border border-gray-300 dark:border-white/8 hover:border-gray-400 dark:hover:border-white/15 focus-within:border-rose-500/50 rounded-xl p-4 mb-4 transition-colors">
          <CardElement options={CARD_STYLE} />
        </div>
        {cardError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
            <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            <p className="text-xs text-red-400 font-bold">{cardError}</p>
          </div>
        )}
        <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-3 text-[11px] text-amber-400/80 leading-relaxed font-medium flex items-start gap-2">
          <span className="shrink-0 mt-0.5">🧪</span>
          <span>TEST MODE — Use card <span className="font-black text-amber-400">4242 4242 4242 4242</span> with any future date &amp; CVC.</span>
        </div>
      </Card>

      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-200 ${
          loading || !stripe
            ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            : 'bg-rose-500 hover:bg-rose-400 text-white hover:shadow-[0_0_40px_rgba(248,68,100,0.4)] hover:-translate-y-px active:scale-95'
        }`}
      >
        {loading
          ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</span>
          : `Securely Pay ${formatPrice(grandTotal)}`}
      </button>

      <div className="flex items-center justify-center gap-2 text-neutral-600 pb-4">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span className="text-[10px] font-bold uppercase tracking-widest">256-bit SSL · Secured by Stripe</span>
      </div>
    </form>
  );
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId, event, selectedSeats, pricing, idempotencyKey: stateIdempotencyKey } = location.state || {};

  const [booking, setBooking] = useState(null);
  const [creatingBooking, setCreatingBooking] = useState(true);
  const [countdown, setCountdown] = useState(300);
  const paymentSucceeded = useRef(false);

  useEffect(() => {
    if (!eventId || !selectedSeats?.length) { navigate("/events"); return; }
    createBooking();
  }, []);

  useEffect(() => {
    if (!creatingBooking) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { clearInterval(timer); toast.error("Session expired. Please re-select seats."); navigate(-1); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [creatingBooking]);

  const createBooking = async () => {
    try {
      const res = await api.post("/bookings", { eventId, seatIds: selectedSeats.map((s) => s._id), idempotencyKey: stateIdempotencyKey || uuidv4() });
      setBooking(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not create booking");
      navigate(-1);
    } finally {
      setCreatingBooking(false);
    }
  };

  if (creatingBooking) return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Preparing Checkout…</p>
    </div>
  );

  const isUrgent = countdown < 60;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1 { font-family: 'Syne', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-white dark:bg-neutral-950 py-10 px-4">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Almost there</p>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Checkout</h1>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-black text-sm transition-all ${
              isUrgent
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-gray-100 dark:bg-neutral-900 border-gray-300 dark:border-white/8 text-gray-700 dark:text-neutral-300'
            }`}>
              <svg className={`w-3.5 h-3.5 ${isUrgent ? 'text-red-600' : 'text-gray-400 dark:text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="tabular-nums">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-8">
            {['Seats', 'Details', 'Pay'].map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`flex items-center gap-1.5 ${i <= 1 ? 'text-rose-400' : 'text-gray-400 dark:text-neutral-500'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${i <= 1 ? 'bg-rose-500 text-white' : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500'}`}>{i + 1}</div>
                  <span className="text-[11px] font-bold hidden sm:block">{step}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px ${i < 1 ? 'bg-rose-500/50' : 'bg-white/5'}`} />}
              </div>
            ))}
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
    </>
  );
};

export default Checkout;