import { useState, useEffect } from "react";
import api from "../utils/axios";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  PENDING: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  CONFIRMED: "bg-green-900/50 text-green-300 border-green-700",
  CANCELLED: "bg-zinc-800 text-zinc-400 border-zinc-700",
  FAILED: "bg-red-900/50 text-red-300 border-red-800",
  REFUNDED: "bg-blue-900/50 text-blue-300 border-blue-800",
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">My Bookings</h1>
        <p className="text-zinc-400 text-sm mb-8">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
        </p>

        {bookings.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <div className="text-4xl mb-4">🎟️</div>
            <p>No bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-white">
                      {booking.event?.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mt-1">
                      {booking.event?.venue} · {formatDate(booking.event?.date)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-md border capitalize ${STATUS_STYLES[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </div>

                {/* Seats */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {booking.seats?.map((seat) => (
                    <span
                      key={seat._id}
                      className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md"
                    >
                      {seat.seatNumber} · {seat.section}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-violet-400 font-semibold">
                    {formatPrice(booking.totalAmount)}
                  </span>

                  {booking.status === "PENDING" && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancelling === booking._id}
                      className="text-xs bg-zinc-800 hover:bg-red-900/50 border border-zinc-700 hover:border-red-800 text-zinc-400 hover:text-red-300 px-3 py-2 rounded-lg transition-colors"
                    >
                      {cancelling === booking._id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}

                  {booking.status === "CONFIRMED" && booking.qrCode && (
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 mb-1">QR Code</p>
                      <img
                        src={booking.qrCode}
                        alt="QR"
                        className="w-16 h-16"
                      />
                    </div>
                  )}
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
