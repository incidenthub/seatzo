import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Calendar, DollarSign, ArrowRight, Shield, ChevronDown, LogOut, Home as HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import adminService from '../services/admin.service';
import { logoutSuccess } from '../store/slices/authSlice';
import Cookies from 'js-cookie';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('user');
    dispatch(logoutSuccess());
    navigate('/');
  };

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [revenue, setRevenue] = useState({ totalRevenue: 0, totalBookings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAll();
  }, [token, user, navigate]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [usersRes, eventsRes, revenueRes] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllEvents(),
        adminService.getPlatformRevenue(),
      ]);

      setUsers(usersRes.data.data || []);
      setEvents(eventsRes.data.data || []);
      setRevenue(revenueRes.data.data || { totalRevenue: 0, totalBookings: 0 });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      await adminService.updateUserRole(userId, newRole);
      await fetchAll(); // Refresh
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const tabs = [
    { key: 'users', label: 'Users', icon: <Users size={16} /> },
    { key: 'events', label: 'Events', icon: <Calendar size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-[#DC3558] selection:text-white">
      {/* Standalone Admin Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-black tracking-tighter">
            SEATZO<span className="text-[#DC3558]">.</span>
          </Link>
          <div className="h-4 w-px bg-stone-200 hidden md:block" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 hidden md:block">
            Platform Protocol
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/" className="p-3 text-stone-400 hover:text-black transition-colors rounded-xl hover:bg-stone-50">
            <HomeIcon size={18} />
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#DC3558] transition-all"
          >
            <LogOut size={14} /> Exit Admin
          </button>
        </div>
      </nav>

      <main className="pt-32 max-w-[1400px] mx-auto px-6 pb-40">
        {/* Header */}
        <header className="mb-20">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Admin Access</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic">Platform Control.</h1>
          </motion.div>
        </header>

        {isLoading ? (
          <div className="py-40 flex justify-center"><LoadingSpinner /></div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 font-bold uppercase tracking-widest text-xs">{error}</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-8 mb-24">
              {[
                { label: 'Total Users', val: users.length, icon: <Users /> },
                { label: 'Total Events', val: events.length, icon: <Calendar /> },
                { label: 'Platform Revenue', val: `₹${((revenue.totalRevenue || 0) / 100).toLocaleString()}`, sub: `${revenue.totalBookings || 0} bookings`, icon: <DollarSign /> },
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
                  {stat.sub && <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mt-2">{stat.sub}</p>}
                </motion.div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-12 border-b border-stone-100 pb-8">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                    activeTab === tab.key
                      ? 'bg-black text-white border-black'
                      : 'border-stone-200 text-stone-400 hover:border-black'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {users.map((u, i) => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100 gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-sm">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold">{u.name}</p>
                        <p className="text-xs text-stone-400">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        u.isVerified ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                      }`}>
                        {u.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>

                    <div className="relative">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={updatingUserId === u._id}
                        className={`appearance-none pl-4 pr-8 py-2 border rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none transition-all ${
                          u.role === 'admin' ? 'bg-black text-white border-black' :
                          u.role === 'organiser' ? 'bg-stone-100 text-stone-700 border-stone-200' :
                          'bg-white text-stone-500 border-stone-200'
                        } disabled:opacity-50`}
                      >
                        <option value="customer">Customer</option>
                        <option value="organiser">Organiser</option>
                        <option value="admin">Admin</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                {events.map((event, i) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100 gap-4"
                  >
                    <div className="flex-1">
                      <h4 className="text-xl font-black tracking-tighter uppercase">{event.title}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                        <span>📍 {event.city}</span>
                        <span>📅 {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                        <span>{event.category}</span>
                        <span>By: {event.organiser?.name || 'Unknown'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-black">{event.availableSeats}/{event.totalSeats}</p>
                        <p className="text-[9px] font-bold text-stone-300 uppercase">Seats Avail.</p>
                      </div>
                      <div className={`px-4 py-2 border rounded-full text-[9px] font-black uppercase tracking-widest ${
                        event.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' :
                        event.status === 'draft' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                        'bg-red-50 text-red-500 border-red-100'
                      }`}>
                        {event.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

    </div>
  );
};

export default AdminDashboard;
