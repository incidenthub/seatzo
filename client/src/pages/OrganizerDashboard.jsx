import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Plus, Edit, Eye, Trash2, ArrowRight, Send, X, LogOut, Home as HomeIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import eventService from '../services/event.service';
import { logoutSuccess } from '../store/slices/authSlice';
import Cookies from 'js-cookie';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('user');
    dispatch(logoutSuccess());
    navigate('/login');
  };

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '', description: '', venue: '', city: '', category: 'concert',
    date: '', basePrice: '', posterUrl: '',
    sections: [
      { name: 'PREMIUM', rows: ['A', 'B'], seatsPerRow: 20, price: 5000 },
      { name: 'GOLD', rows: ['C', 'D', 'E'], seatsPerRow: 30, price: 3000 },
      { name: 'SILVER', rows: ['F', 'G'], seatsPerRow: 40, price: 2000 },
      { name: 'GENERAL', rows: ['H', 'I', 'J'], seatsPerRow: 50, price: 1000 },
    ],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || (user?.role !== 'organiser' && user?.role !== 'admin')) {
      navigate('/login');
      return;
    }
    fetchEvents();
  }, [token, user, navigate]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      // Get all events — the backend filters by organiser when using the public route
      const res = await eventService.getAllEvents();
      const allEvents = res.data?.events || res.data?.data || [];
      setEvents(allEvents);

      // Fetch analytics for each event
      const analyticsMap = {};
      for (const evt of allEvents) {
        try {
          const analyticsRes = await eventService.getAnalytics(evt._id);
          analyticsMap[evt._id] = analyticsRes.data;
        } catch {
          // Analytics may not be available for all events
        }
      }
      setAnalytics(analyticsMap);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await eventService.createEvent({
        ...createForm,
        basePrice: Number(createForm.basePrice),
      });
      setShowCreateModal(false);
      setCreateForm({ title: '', description: '', venue: '', city: '', category: 'concert', date: '', basePrice: '', posterUrl: '', sections: createForm.sections });
      await fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (eventId) => {
    try {
      await eventService.publishEvent(eventId);
      await fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to publish event');
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to cancel this event?')) return;
    try {
      await eventService.deleteEvent(eventId);
      await fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete event');
    }
  };

  const totalRevenue = Object.values(analytics).reduce((sum, a) => sum + (a?.totalRevenue || 0), 0);
  const totalBookings = Object.values(analytics).reduce((sum, a) => sum + (a?.totalBookings || 0), 0);
  const publishedCount = events.filter(e => e.status === 'published').length;
  const draftCount = events.filter(e => e.status === 'draft').length;

  return (
    <div className="min-h-screen bg-white selection:bg-[#DC3558] selection:text-white">
      {/* Standalone Dashboard Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="text-xl font-black tracking-tighter cursor-default">
            SEATZO<span className="text-[#DC3558]">.</span>
          </div>
          <div className="h-4 w-px bg-stone-200 hidden md:block" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 hidden md:block">
            Internal Management
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#DC3558] transition-all"
          >
            <LogOut size={14} /> End Session
          </button>
        </div>
      </nav>

      <main className="pt-32 max-w-[1400px] mx-auto px-6 pb-40">
        {/* Header */}
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#DC3558] mb-4">Command Center</p>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic">Event Manager.</h1>
          </motion.div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:translate-y-[-2px] transition-all shadow-2xl shadow-stone-900/20"
          >
            <Plus size={16} /> Deploy New Event
          </button>
        </header>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-24">
          {[
            { label: 'Published Events', val: publishedCount, sub: `${draftCount} in draft`, icon: <BarChart3 /> },
            { label: 'Total Bookings', val: totalBookings, sub: 'Confirmed bookings', icon: <Users /> },
            { label: 'Total Revenue', val: `₹${(totalRevenue / 100).toLocaleString()}`, sub: `From ${events.length} events`, icon: <TrendingUp /> },
            { label: 'Avg Revenue', val: events.length > 0 ? `₹${Math.round(totalRevenue / 100 / events.length).toLocaleString()}` : '₹0', sub: 'Per event average', icon: <DollarSign /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-stone-50 rounded-[2rem] border border-stone-100/50"
            >
              <div className="flex justify-between items-center mb-8 text-stone-300">
                {stat.icon}
                <ArrowRight size={16} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">{stat.label}</p>
              <h3 className="text-4xl font-black tracking-tighter mb-1">{stat.val}</h3>
              <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-12">
          <div className="flex justify-between items-end border-b border-stone-100 pb-8">
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Your Events</h2>
            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest italic">{events.length} event(s)</span>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 font-bold uppercase tracking-widest text-xs">{error}</div>
          ) : events.length === 0 ? (
            <div className="py-40 text-center">
              <p className="text-stone-300 text-6xl font-black italic mb-4">EMPTY.</p>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Create your first event to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event, i) => {
                const a = analytics[event._id];
                const occupancy = event.totalSeats > 0
                  ? Math.round(((event.totalSeats - (event.availableSeats || event.totalSeats)) / event.totalSeats) * 100)
                  : 0;

                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex flex-col md:flex-row items-center justify-between p-8 rounded-[2rem] hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 w-full">
                      {/* Event Info */}
                      <div className="flex-1">
                        <h4 className="text-2xl font-black tracking-tighter uppercase mb-2">{event.title}</h4>
                        <div className="flex items-center gap-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          <span>📍 {event.city}</span>
                          <span>📅 {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                          <span>{event.category}</span>
                        </div>
                      </div>

                      {/* Occupancy */}
                      <div className="w-32">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full transition-all" style={{ width: `${occupancy}%` }} />
                          </div>
                          <span className="text-[10px] font-black">{occupancy}%</span>
                        </div>
                        <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Occupancy</p>
                      </div>

                      {/* Revenue */}
                      <div className="text-right">
                        <p className="text-lg font-black tracking-tighter">₹{((a?.totalRevenue || 0) / 100).toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Revenue</p>
                      </div>

                      {/* Status */}
                      <div className={`px-4 py-2 border rounded-full text-[9px] font-black uppercase tracking-widest ${event.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' :
                          event.status === 'draft' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                            'bg-red-50 text-red-500 border-red-100'
                        }`}>
                        {event.status}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/events/${event._id}`)} title="View" className="p-3 bg-stone-100 rounded-xl hover:bg-black hover:text-white transition-all">
                          <Eye size={16} />
                        </button>
                        {event.status === 'draft' && (
                          <button onClick={() => handlePublish(event._id)} title="Publish" className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all">
                            <Send size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(event._id)} title="Cancel" className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-12"
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">Create Event</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-8">
              {[
                { name: 'title', label: 'Event Title', type: 'text', required: true },
                { name: 'description', label: 'Description', type: 'textarea', required: true },
                { name: 'venue', label: 'Venue', type: 'text', required: true },
                { name: 'city', label: 'City', type: 'text', required: true },
                { name: 'date', label: 'Date & Time', type: 'datetime-local', required: true },
                { name: 'basePrice', label: 'Base Price (₹ in paise)', type: 'number', required: true },
                { name: 'posterUrl', label: 'Poster URL', type: 'url' },
              ].map(field => (
                <div key={field.name} className="group">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 group-focus-within:text-black transition-colors">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      value={createForm[field.name]}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium placeholder:text-stone-200 resize-none"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      value={createForm[field.name]}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium placeholder:text-stone-200"
                    />
                  )}
                </div>
              ))}

              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3">Category</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium"
                >
                  <option value="concert">Concert</option>
                  <option value="movie">Movie</option>
                  <option value="sports">Sports</option>
                  <option value="theatre">Theatre</option>
                  <option value="standup">Stand-Up</option>
                </select>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default OrganizerDashboard;
