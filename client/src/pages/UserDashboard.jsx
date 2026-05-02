import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-blue-50 text-blue-700 border-blue-200",
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

  useEffect(() => {
    fetchBookings();
  }, []);

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
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#f84464] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#333] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">My Bookings</h1>
            <p className="text-gray-500 font-medium text-sm">
              Manage your event tickets and history
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
             <span className="text-[10px] font-black text-gray-400 uppercase block tracking-tighter">Total Orders</span>
             <span className="text-xl font-black text-[#f84464]">{bookings.length}</span>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-6">🎟️</div>
            <p className="text-gray-500 font-medium mb-8">You haven't booked any tickets yet.</p>
            <Link to="/events" className="bg-[#f84464] text-white px-8 py-3 rounded-lg font-bold">Browse Events</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex gap-4">
                       <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          <img src={booking.event?.posterUrl || "https://images.unsplash.com/photo-1514525253344-9914f25af042?auto=format&fit=crop&w=400&q=80"} className="w-full h-full object-cover" />
                       </div>
                       <div>
                        <h3 className="font-bold text-lg text-[#333] mb-1">
                          {booking.event?.title}
                        </h3>
                        <p className="text-gray-500 text-sm font-medium">
                          {booking.event?.venue} · {formatDate(booking.event?.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded border uppercase tracking-wider ${STATUS_STYLES[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Seats */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {booking.seats?.map((seat) => (
                      <span
                        key={seat._id}
                        className="text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-100 px-2 py-1 rounded uppercase tracking-tighter"
                      >
                        {seat.seatNumber} · {seat.section}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex flex-col">
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Amount Paid</span>
                       <span className="text-[#333] font-black text-lg">
                        {formatPrice(booking.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {booking.status === "PENDING" && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancelling === booking._id}
                          className="text-xs font-bold text-gray-400 hover:text-red-500 px-4 py-2 transition-colors"
                        >
                          {cancelling === booking._id ? "Cancelling..." : "Cancel Booking"}
                        </button>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <>
                          <Link
                            to={`/tickets/${booking._id}`}
                            className="bg-[#f84464] hover:bg-[#d63955] text-white font-bold text-xs px-6 py-3 rounded-lg transition-all shadow-lg shadow-[#f84464]/10 flex items-center gap-2 uppercase tracking-wider"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                            </svg>
                            View Ticket
                          </Link>
                        </>
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
