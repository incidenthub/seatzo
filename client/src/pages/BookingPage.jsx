import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CreditCard, ArrowLeft, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../config/stripe';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import SeatGrid from '../components/SeatGrid';
import useSeatPolling from '../hooks/useSeatPolling';
import bookingService from '../services/booking.service';
import paymentService from '../services/payment.service';

// ─── Stripe Checkout Form ─────────────────────────────────────────────────────
const CheckoutForm = ({ booking, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create payment intent via our API
      const idempotencyKey = crypto.randomUUID();
      const paymentRes = await paymentService.createPayment(
        booking._id,
        booking.totalAmount,
        idempotencyKey
      );

      const { clientSecret } = paymentRes.data.data;

      // 2. Confirm card payment with Stripe.js
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        onError?.(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent, paymentRes.data.data.paymentId);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.error || err.message || 'Payment failed';
      setError(msg);
      onError?.(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '18px',
        fontWeight: '500',
        color: '#111827',
        fontFamily: 'inherit',
        '::placeholder': { color: '#d1d5db' },
      },
      invalid: { color: '#ef4444' },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="group">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6 group-focus-within:text-black">
          Card Details
        </label>
        <div className="pb-4 border-b border-stone-100 focus-within:border-black transition-all">
          <CardElement options={cardStyle} />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 uppercase tracking-widest">
          {error}
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isProcessing || !stripe}
          className="w-full group py-6 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:gap-6 transition-all disabled:opacity-50"
        >
          {isProcessing ? 'Authenticating' : `Authorize ₹${booking.totalAmount}`}
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
            />
          ) : <CreditCard size={18} />}
        </button>
      </div>

      <div className="flex items-center gap-4 py-8 border-t border-stone-50">
        <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300">
          <ShieldCheck size={20} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-relaxed">
          Payment encrypted via Stripe Secure™ • PCI DSS Level 1 Certified <br />
          Atomic seating lock active for 5:00 minutes.
        </p>
      </div>
    </form>
  );
};

// ─── Main Booking Page ────────────────────────────────────────────────────────
const BookingPage = () => {
  const { id: eventId, bookingId: existingBookingId } = useParams();
  const navigate = useNavigate();
  const { seats, pricing, viewers, loading, refresh } = useSeatPolling(eventId);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [booking, setBooking] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'checkout'
  const [error, setError] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  // If we have an existing bookingId from the URL, load it
  useEffect(() => {
    if (existingBookingId) {
      loadExistingBooking(existingBookingId);
    }
  }, [existingBookingId]);

  const loadExistingBooking = async (bId) => {
    try {
      const res = await bookingService.getBookingById(bId);
      setBooking(res.data.data);
      setStep('checkout');
    } catch (err) {
      setError('Failed to load booking');
    }
  };

  const handleCheckout = async (seats, total) => {
    setIsCreatingBooking(true);
    setError(null);

    try {
      // Create booking via API with idempotency key
      const idempotencyKey = crypto.randomUUID();
      const seatIds = seats.map(s => s._id);

      const res = await bookingService.createBooking(eventId, seatIds, idempotencyKey);
      setBooking(res.data.data);
      setStep('checkout');
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.error || 'Failed to create booking';
      setError(msg);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent, paymentId) => {
    navigate(`/booking-confirmation/${booking._id}`);
  };

  const handlePaymentError = (message) => {
    setError(message);
  };

  const totalAmount = selectedSeats.reduce((sum, s) => sum + (s.currentPrice || s.price || 0), 0);
  const fees = Math.round(totalAmount * 0.12);
  const finalTotal = totalAmount + fees;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-40 max-w-[1400px] mx-auto px-6 pb-40">
        {step === 'select' ? (
          <>
            <header className="mb-8">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <ArrowLeft size={14} /> Back to event
              </button>
              <h1 className="text-6xl font-black tracking-tighter uppercase italic">Select Seats.</h1>
              {viewers > 0 && (
                <p className="text-stone-400 font-bold uppercase tracking-[0.2em] text-xs mt-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {viewers} people viewing this event right now
                </p>
              )}
            </header>

            {error && (
              <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 uppercase tracking-widest">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-40 text-center text-stone-400 font-bold uppercase tracking-widest text-xs">
                Loading seat map...
              </div>
            ) : (
              <SeatGrid
                eventId={eventId}
                seats={seats}
                refresh={refresh}
                onSelectionChange={setSelectedSeats}
                onCheckout={handleCheckout}
              />
            )}

            {isCreatingBooking && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-12 rounded-[2rem] text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-stone-200 border-t-black rounded-full mx-auto mb-4"
                  />
                  <p className="text-xs font-black uppercase tracking-widest">Creating Reservation...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col lg:flex-row gap-24 items-start">
            {/* Left: Checkout Form */}
            <div className="w-full lg:w-[60%] order-2 lg:order-1">
              <header className="mb-16">
                <button onClick={() => setStep('select')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                  <ArrowLeft size={14} /> Back to seat selection
                </button>
                <h1 className="text-6xl font-black tracking-tighter uppercase italic">Secure Checkout.</h1>
              </header>

              {error && (
                <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 uppercase tracking-widest">
                  {error}
                </div>
              )}

              <Elements stripe={stripePromise}>
                <CheckoutForm
                  booking={booking}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </div>

            {/* Right: Summary */}
            <div className="w-full lg:w-[40%] bg-stone-50 p-12 lg:p-16 rounded-[3rem] order-1 lg:order-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-12">Reservation Summary</h2>

              <div className="space-y-8">
                {booking?.seats?.map((seat, i) => (
                  <div key={seat._id || i} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center font-black group-hover:bg-black group-hover:text-white transition-colors">
                        {seat.seatNumber || `S${i + 1}`}
                      </div>
                      <span className="font-bold text-lg">{seat.section || 'Standard'}</span>
                    </div>
                    <span className="font-bold">₹{seat.price || 0}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-12 border-t border-stone-200/50 space-y-4">
                <div className="flex justify-between items-center text-stone-400 text-[10px] font-black uppercase tracking-widest">
                  <span>Booking ID</span>
                  <span className="font-mono">{booking?._id?.slice(-8)}</span>
                </div>
                <div className="flex justify-between items-center pt-8">
                  <span className="font-black uppercase tracking-tighter text-xl italic">Total</span>
                  <span className="text-4xl font-black tracking-tighter">₹{booking?.totalAmount || 0}</span>
                </div>
              </div>

              <div className="mt-12 bg-white/50 p-6 rounded-2xl border border-stone-200/30">
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 leading-relaxed text-center">
                  CONFIRMING THIS RESERVATION WILL INITIATE AN ATOMIC SEAT LOCK. ONCE AUTHORIZED, THE ALLOCATION IS PERMANENT.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
