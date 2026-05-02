import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  PENDING:   "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20",
  CONFIRMED: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20",
  CANCELLED: "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-white/10",
  FAILED:    "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20",
  REFUNDED:  "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
};

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId) => {
    setCancelling(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not cancel booking");
    } finally {
      setCancelling(null);
    }
  };

  const formatPrice = (paise) => `₹${(paise / 100).toLocaleString("en-IN")}`;
  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center transition-colors duration-200">
      <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white transition-colors duration-200 px-6 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1 text-gray-900 dark:text-white">My Bookings</h1>
            <p className="text-gray-500 dark:text-neutral-400 font-medium text-sm">Manage your event tickets and history</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/8 shadow-sm">
            <span className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase block tracking-tighter">Total Orders</span>
            <span className="text-xl font-black text-rose-500">{bookings.length}</span>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="text-6xl mb-6">🎟️</div>
            <p className="text-gray-500 dark:text-neutral-400 font-medium mb-8">You haven't booked any tickets yet.</p>
            <Link to="/events" className="bg-rose-500 hover:bg-rose-400 text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md dark:hover:border-white/10 transition-all"
              >
                <div className="p-6">
                  {/* Top: event info + status */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-20 bg-gray-100 dark:bg-neutral-800 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={booking.event?.posterUrl || "https://images.unsplash.com/photo-1514525253344-9914f25af042?auto=format&fit=crop&w=400&q=80"}
                          className="w-full h-full object-cover"
                          alt={booking.event?.title}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{booking.event?.title}</h3>
                        <p className="text-gray-400 dark:text-neutral-500 text-sm font-medium">
                          {booking.event?.venue} · {formatDate(booking.event?.date)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded border uppercase tracking-wider shrink-0 ${STATUS_STYLES[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Seats */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {booking.seats?.map((seat) => (
                      <span
                        key={seat._id}
                        className="text-[10px] font-bold bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-white/8 px-2 py-1 rounded uppercase tracking-tighter"
                      >
                        {seat.seatNumber} · {seat.section}
                      </span>
                    ))}
                  </div>

                  {/* Footer: amount + actions */}
                  <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-tighter">Amount Paid</span>
                      <span className="text-gray-900 dark:text-white font-black text-lg">{formatPrice(booking.totalAmount)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {booking.status === "PENDING" && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancelling === booking._id}
                          className="text-xs font-bold text-gray-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 px-4 py-2 transition-colors disabled:opacity-50"
                        >
                          {cancelling === booking._id ? "Cancelling..." : "Cancel Booking"}
                        </button>
                      )}
                      {booking.status === "CONFIRMED" && (
                        <Link
                          to={`/tickets/${booking._id}`}
                          className="bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg shadow-rose-500/10 flex items-center gap-2 uppercase tracking-wider hover:-translate-y-px active:scale-95"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          </svg>
                          View Ticket
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;