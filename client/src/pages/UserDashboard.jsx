import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Download, ArrowRight, User, Settings, ShieldCheck, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import bookingService from '../services/booking.service';
import { logoutStart } from '../store/slices/authSlice';

const UserDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [token, navigate]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getBookings();
      setBookings(res.data.data || res.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setCancellingId(bookingId);
    try {
      await bookingService.cancelBooking(bookingId);
      // Refresh bookings list
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = () => {
    dispatch(logoutStart());
    navigate('/login');
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-white text-black border-black';
      case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'CANCELLED': return 'bg-red-50 text-red-500 border-red-100';
      case 'FAILED': return 'bg-red-50 text-red-500 border-red-100';
      case 'REFUNDED': return 'bg-blue-50 text-blue-500 border-blue-100';
      default: return 'bg-stone-50 text-stone-500 border-stone-100';
    }
  };

  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const totalSpent = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-40 max-w-[1400px] mx-auto px-6 pb-40">
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white italic font-black">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {user?.name || 'Member'}
              </span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic">Control Center.</h1>
          </motion.div>

          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="px-6 py-3 border border-stone-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center gap-2"
            >
              <Settings size={14} /> Logout
            </button>
            {user?.role === 'organiser' && (
              <Link
                to="/organizer-dashboard"
                className="px-6 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-black/20"
              >
                <User size={14} /> Organiser Panel
              </Link>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            { label: 'Active Reservations', val: confirmedBookings.length, icon: <Ticket /> },
            { label: 'Curation History', val: bookings.length, icon: <Calendar /> },
            { label: 'Total Invested', val: `₹${totalSpent.toLocaleString()}`, icon: <ShieldCheck /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 bg-stone-50 rounded-[2.5rem] border border-stone-100/50"
            >
              <div className="flex justify-between items-center mb-10 text-stone-300">
                {stat.icon}
                <ArrowRight size={18} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">{stat.label}</p>
              <h3 className="text-5xl font-black tracking-tighter">{stat.val}</h3>
            </motion.div>
          ))}
        </div>

        {/* Reservations List */}
        <div className="space-y-12">
          <div className="flex justify-between items-end border-b border-stone-100 pb-8">
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">All Reservations</h2>
            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest italic">
              {bookings.length} item(s) found
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 font-bold uppercase tracking-widest text-xs">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="py-40 text-center">
              <p className="text-stone-300 text-6xl font-black italic mb-4">VOID.</p>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-8">No bookings yet.</p>
              <Link to="/events" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs">
                Browse Events <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking, i) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative flex flex-col md:flex-row items-center justify-between p-8 rounded-[2rem] hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-10 w-full">
                    {/* Visual ID */}
                    <div className="w-16 h-16 bg-black text-white flex flex-col items-center justify-center rounded-2xl shrink-0 group-hover:rotate-6 transition-transform">
                      <span className="text-[8px] font-black uppercase tracking-tighter border-b border-white/20 pb-1 mb-1">Pass</span>
                      <span className="text-xs font-black">
                        {booking.seats?.[0]?.seatNumber || booking.seats?.[0] || '—'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 italic mb-2 block">
                        SZ-{booking._id?.slice(-8)?.toUpperCase()}
                      </span>
                      <h4 className="text-2xl font-black tracking-tighter uppercase">
                        {booking.event?.title || 'Event'}
                      </h4>
                      <div className="flex items-center gap-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest pt-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {booking.event?.date
                            ? new Date(booking.event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                            : '—'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Ticket size={12} /> {booking.seats?.length || 0} UNIT(S)
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Status & Actions */}
                    <div className="flex items-center gap-6 text-right w-full md:w-auto mt-6 md:mt-0 justify-between md:justify-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Paid</p>
                        <p className="text-xl font-black tracking-tighter italic">₹{(booking.totalAmount || 0).toLocaleString()}</p>
                      </div>
                      <div className={`px-4 py-2 border rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyles(booking.status)}`}>
                        {booking.status}
                      </div>
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="p-3 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 transition-all text-red-500"
                          title="Cancel Booking"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <Link
                        to={`/booking-confirmation/${booking._id}`}
                        className="p-4 bg-white border border-stone-200 rounded-2xl hover:bg-black hover:text-white transition-all"
                      >
                        <Download size={18} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
