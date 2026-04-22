import { useLocation, Link } from 'react-router-dom';

const BookingConfirmation = () => {
  const location = useLocation();
  const { booking, event } = location.state || {};

  if (!booking) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
      No booking found. <Link to="/" className="text-violet-400 ml-2">Go home</Link>
    </div>
  );

  const formatPrice = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="max-w-lg mx-auto text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">Booking Created!</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Your booking is pending payment confirmation.
        </p>

        {/* Booking details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-left mb-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Booking ID</span>
              <span className="text-white font-mono text-xs">{booking._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Event</span>
              <span className="text-white">{event?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Status</span>
              <span className="text-yellow-400 capitalize">{booking.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total</span>
              <span className="text-violet-400 font-semibold">{formatPrice(booking.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/dashboard"
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-sm font-medium transition-colors text-center"
          >
            My Bookings
          </Link>
          <Link
            to="/"
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl text-sm font-medium transition-colors text-center"
          >
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;