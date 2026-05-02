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
      color: "#333",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "16px",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#a1a1aa" },
    },
    invalid: { color: "#f84464", iconColor: "#f84464" },
  },
};

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
      const { data } = await api.post("/payments/create", {
        bookingId: booking._id,
        idempotencyKey,
        amount: grandTotalInPaise,
      });

      const { clientSecret } = data.data;

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: elements.getElement(CardElement) } },
      );

      if (error) {
        setCardError(error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        const confirmRes = await api.post(`/bookings/${booking._id}/confirm`, {
          paymentIntentId: paymentIntent.id,
        });

        const confirmedBooking = confirmRes.data.data;

        toast.success("Payment successful! Booking confirmed 🎉");
        navigate("/booking-confirmation", {
          state: { booking: confirmedBooking, event },
          replace: true,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Event Details</h3>
        <div className="flex gap-4">
           <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              <img src={event?.posterUrl || "https://images.unsplash.com/photo-1514525253344-9914f25af042?auto=format&fit=crop&w=400&q=80"} className="w-full h-full object-cover" />
           </div>
           <div>
            <div className="font-black text-[#333] text-lg leading-tight mb-1">{event?.title}</div>
            <div className="text-gray-500 text-sm font-medium">{event?.venue} · {event?.city}</div>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Selected Seats</h3>
        <div className="space-y-3">
          {selectedSeats.map((seat) => (
            <div key={seat._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div>
                <span className="font-bold text-[#333] text-sm">Seat {seat.seatNumber}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase ml-2">{seat.section}</span>
              </div>
              <span className="text-sm font-bold text-[#333]">{formatPrice(seat.price)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium text-gray-500">
            <span>Ticket Subtotal</span>
            <span>{formatPrice(seatTotal)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-500">
            <span>Convenience Fees (12%)</span>
            <span>{formatPrice(fees)}</span>
          </div>
          <div className="pt-3 border-t border-gray-50 flex justify-between items-end">
            <span className="font-bold text-[#333]">Total Amount</span>
            <span className="text-2xl font-black text-[#f84464]">{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Payment Details</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <CardElement options={CARD_STYLE} />
        </div>
        {cardError && <p className="text-xs text-[#f84464] font-bold mb-4">{cardError}</p>}
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-[11px] text-amber-700 leading-relaxed font-medium">
          🧪 TEST MODE: Use 4242 4242 4242 4242 for all fields.
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
          loading ? 'bg-gray-100 text-gray-400' : 'bg-[#f84464] text-white hover:bg-[#d63955] shadow-[#f84464]/20'
        }`}
      >
        {loading ? "Processing..." : `Securely Pay ${formatPrice(grandTotal)}`}
      </button>

      <div className="flex items-center justify-center gap-2 text-gray-400 pb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        <span className="text-[10px] font-bold uppercase tracking-tighter">Secured by Stripe</span>
      </div>
    </form>
  );
};

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
      navigate("/events");
      return;
    }
    createBooking();
  }, []);

  useEffect(() => {
    if (!creatingBooking) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            toast.error("Session expired. Please re-select seats.");
            navigate(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [creatingBooking]);

  const createBooking = async () => {
    try {
      const res = await api.post("/bookings", {
        eventId,
        seatIds: selectedSeats.map((s) => s._id),
        idempotencyKey: stateIdempotencyKey || uuidv4(),
      });
      setBooking(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not create booking");
      navigate(-1);
    } finally {
      setCreatingBooking(false);
    }
  };

  if (creatingBooking) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-[#f84464] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Preparing Checkout...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-12 px-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
           <h1 className="text-3xl font-black tracking-tight text-[#333]">Checkout</h1>
           <div className={`px-4 py-2 rounded-full border font-black text-xs ${countdown < 60 ? 'bg-red-50 text-[#f84464] border-red-100' : 'bg-white text-gray-500 border-gray-200'}`}>
             ⏱ {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
           </div>
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