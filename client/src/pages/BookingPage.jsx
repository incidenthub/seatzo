import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CreditCard, ArrowLeft, ShieldCheck, Info, ChevronRight, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../config/stripe';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import SeatGrid from '../components/SeatGrid';
import useSeatPolling from '../hooks/useSeatPolling';
import bookingService from '../services/booking.service';
import paymentService from '../services/payment.service';

// ─── Stripe Checkout Form (BMS Style) ─────────────────────────────────────────
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
      const idempotencyKey = crypto.randomUUID();
      const paymentRes = await paymentService.createPayment(booking._id, booking.totalAmount, idempotencyKey);
      const { clientSecret } = paymentRes.data.data;

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (stripeError) {
        setError(stripeError.message);
        onError?.(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent, paymentRes.data.data.paymentId);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
      onError?.(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
      <div className="mb-8">
        <h3 className="text-sm font-bold text-stone-700 uppercase mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-[#F84464]" /> Debit / Credit Card
        </h3>
        <div className="p-4 border border-stone-300 rounded-md bg-stone-50 focus-within:border-[#F84464] transition-all">
          <CardElement options={{
            style: {
              base: { fontSize: '16px', color: '#333', '::placeholder': { color: '#aab7c4' } },
              invalid: { color: '#F84464' },
            }
          }} />
        </div>
      </div>

      {error && <div className="mb-4 text-xs font-semibold text-[#F84464]">{error}</div>}

      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full py-4 bg-[#F84464] text-white rounded-md font-bold text-sm shadow-lg hover:bg-[#d63a56] transition-colors disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : `Make Payment`}
      </button>

      <p className="mt-4 text-[11px] text-stone-500 text-center">
        By clicking "Make Payment" you agree to the Terms & Conditions
      </p>
    </form>
  );
};

// ─── Main Booking Page ────────────────────────────────────────────────────────
const BookingPage = () => {
  const { id: eventId, bookingId: existingBookingId } = useParams();
  const navigate = useNavigate();
  const { seats, viewers, loading, refresh } = useSeatPolling(eventId);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [booking, setBooking] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'checkout'
  const [error, setError] = useState(null);

  const handleCheckout = async (seats) => {
    try {
      const idempotencyKey = crypto.randomUUID();
      const seatIds = seats.map(s => s._id);
      const res = await bookingService.createBooking(eventId, seatIds, idempotencyKey);
      setBooking(res.data.data);
      setStep('checkout');
    } catch (err) {
      setError('Reservation failed. Seats might have been taken.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Navbar />

      {/* Progress Header */}
      <div className="bg-white border-b border-stone-200 pt-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-600 hover:text-[#F84464] font-medium text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
            <span className={step === 'select' ? 'text-[#F84464]' : 'text-stone-400'}>01 SEAT SELECTION</span>
            <ChevronRight size={14} className="text-stone-300" />
            <span className={step === 'checkout' ? 'text-[#F84464]' : 'text-stone-400'}>02 PAYMENT</span>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {step === 'select' ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-8 border border-stone-200">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-2xl font-bold text-stone-800">Choose your seats</h1>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                  <Info size={14} /> Screen this way
                </p>
              </div>
              {viewers > 0 && (
                <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold border border-orange-100 animate-pulse">
                  {viewers} PEOPLE ARE LOOKING AT THIS RIGHT NOW
                </div>
              )}
            </div>

            <SeatGrid
              eventId={eventId}
              seats={seats}
              refresh={refresh}
              onSelectionChange={setSelectedSeats}
              onCheckout={handleCheckout}
            />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Payment Options */}
            <div className="w-full lg:w-2/3 space-y-4">
              <div className="bg-[#333545] text-white p-4 rounded-t-lg font-bold text-sm uppercase flex items-center gap-2">
                <ShieldCheck size={18} className="text-green-400" /> Payment Options
              </div>
              <CheckoutForm 
                booking={booking} 
                onSuccess={() => navigate(`/booking-confirmation/${booking._id}`)} 
                onError={setError}
              />
            </div>

            {/* Right: Order Summary (The "Ticket" look) */}
            <aside className="w-full lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-5 border-b border-dashed border-stone-200 bg-stone-50">
                  <h2 className="text-[#F84464] font-bold text-xs uppercase tracking-widest mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    {booking?.seats?.map((seat, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-stone-700">
                          {seat.section || 'Classic'} - {seat.seatNumber}
                        </span>
                        <span className="text-sm font-bold">₹{seat.price?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Convenience Fees</span>
                    <span>₹{(booking?.totalAmount * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="pt-4 mt-2 border-t border-stone-100 flex justify-between items-center">
                    <span className="text-sm font-bold uppercase">Amount Payable</span>
                    <span className="text-xl font-extrabold text-[#F84464]">₹{booking?.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-[#FFF9E5] p-4 flex gap-3 border-t border-stone-100">
                  <Ticket className="text-orange-500 shrink-0" size={20} />
                  <p className="text-[10px] text-stone-600 font-medium leading-relaxed">
                    By proceeding, I express my consent to the T&Cs and the Cancellation Policy of this event.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-stone-400">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase">100% Safe & Secure Payments</span>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;