import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ArrowLeft, Info, Ticket, CreditCard, ShieldCheck, ChevronRight, Users, MapPin, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../config/stripe';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import SeatGrid from '../components/SeatGrid';
import useSeatPolling from '../hooks/useSeatPolling';
import bookingService from '../services/booking.service';
import authService from '../services/auth.service';
import paymentService from '../services/payment.service';

const refreshAccessToken = async () => {
  const response = await authService.refreshToken();
  const newToken = response.data?.accessToken;

  if (!newToken) {
    throw new Error('Session expired');
  }

  Cookies.set('accessToken', newToken, { expires: 7, path: '/' });
  return newToken;
};

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
      await refreshAccessToken();
      const idempotencyKey = crypto.randomUUID();
      const paymentRes = await paymentService.createPayment(
        booking._id,
        booking.totalAmount,
        idempotencyKey
      );

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Card Information
        </label>
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 focus-within:border-red-500 focus-within:bg-white transition-all">
          <CardElement options={{
            style: {
              base: { fontSize: '16px', color: '#333', '::placeholder': { color: '#aab7c4' } },
              invalid: { color: '#dc2626' },
            }
          }} />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">Payment Error</p>
            <p className="text-sm text-red-800 mt-1">{error}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Complete Payment - ₹{booking.totalAmount.toLocaleString('en-IN')}
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          By completing payment, you agree to our{' '}
          <a href="#" className="text-red-600 hover:text-red-700 underline">Terms & Conditions</a>
        </p>
        <div className="flex items-center justify-center mt-3">
          <ShieldCheck className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-xs text-gray-600">Secured by Stripe</span>
        </div>
      </div>
    </form>
  );
};

// ─── Main Booking Page ────────────────────────────────────────────────────────
const BookingPage = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { seats, viewers, loading, refresh } = useSeatPolling(eventId);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [buyModeOpen, setBuyModeOpen] = useState(false);
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);

  const selectedTotal = selectedSeats.reduce(
    (sum, seat) => sum + (Number(seat.currentPrice || seat.price) || 0),
    0
  );

  const handleCheckout = async (selectedSeatList) => {
    if (!selectedSeatList.length) return;

    try {
      setCheckoutError(null);
      await refreshAccessToken();
      const idempotencyKey = crypto.randomUUID();
      const seatIds = selectedSeatList.map((seat) => seat._id);
      const res = await bookingService.createBooking(eventId, seatIds, idempotencyKey);
      setCheckoutBooking(res.data.data);
      setBuyModeOpen(true);
    } catch (err) {
      setCheckoutError(err.response?.data?.error?.message || err.message || 'Reservation failed. Seats might have been taken.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Event
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Select Your Seats</h1>
              <p className="text-gray-600 mt-2 text-lg">Choose the best seats for your experience</p>
            </div>

            {viewers > 0 && (
              <div className="flex items-center bg-linear-to-r from-orange-100 to-orange-50 text-orange-800 px-4 py-3 rounded-full border border-orange-200 shadow-sm">
                <Users className="w-5 h-5 mr-2" />
                <span className="font-medium">{viewers} people viewing</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <Info className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Screen this way</h2>
                    <p className="text-sm text-gray-600">Select your preferred seats</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Click seats to select
                </div>
              </div>

              {loading ? (
                <div className="py-32 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-6"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading seats...</h3>
                  <p className="text-gray-600">Please wait while we fetch the latest availability</p>
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Seats Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Selected Seats</h2>
                <p className="text-sm text-gray-600">{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected</p>
              </div>

              <div className="p-6">
                {selectedSeats.length > 0 ? (
                  <div className="space-y-4">
                    {selectedSeats.map((seat, i) => (
                      <div key={i} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <span className="font-semibold text-gray-900 block">
                            {seat.section || 'Standard'} - {seat.seatNumber}
                          </span>
                          <p className="text-sm text-gray-600">Row {seat.seatNumber}</p>
                        </div>
                        <span className="font-bold text-lg text-gray-900">
                          ₹{Number(seat.price || seat.currentPrice || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}

                    <div className="border-t border-gray-200 pt-4 mt-6">
                      <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                        <span>Total Amount</span>
                        <span className="text-red-600">
                          ₹{selectedTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No seats selected yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click on available seats to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Messages */}
            {checkoutError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Booking Error</h4>
                    <p className="text-sm text-red-800">{checkoutError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {buyModeOpen && checkoutBooking && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Booking Created!</h4>
                    <p className="text-sm text-green-800">Complete your payment below to secure your seats.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Section */}
            {buyModeOpen && checkoutBooking && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-linear-to-r from-green-50 to-white">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <ShieldCheck className="w-6 h-6 text-green-600 mr-3" />
                    Secure Payment
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your payment is protected by industry-standard security
                  </p>
                </div>

                <div className="p-6">
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      booking={checkoutBooking}
                      onSuccess={() => navigate(`/booking-confirmation/${checkoutBooking._id}`)}
                      onError={setCheckoutError}
                    />
                  </Elements>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <Info className="w-6 h-6 text-blue-600 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Select your preferred seats from the grid</li>
                    <li>• Review your selection in the sidebar</li>
                    <li>• Complete secure payment to confirm booking</li>
                    <li>• Receive confirmation and e-ticket via email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;