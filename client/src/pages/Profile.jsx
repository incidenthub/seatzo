import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, CreditCard, LogOut, Edit2, Check, Ticket, Calendar, Download, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import bookingService from '../services/booking.service';
import { logoutStart } from '../store/slices/authSlice';

const Profile = () => {
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('identity');
    
    // Booking states
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const tabs = [
        { id: 'identity', label: 'Identity', icon: <User size={18} /> },
        { id: 'reservations', label: 'Reservations', icon: <Ticket size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'billing', label: 'Payments', icon: <CreditCard size={18} /> },
    ];

    useEffect(() => {
        if (!token) navigate('/');
        if (activeTab === 'reservations') {
            fetchBookings();
        }
    }, [activeTab, token, navigate]);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const res = await bookingService.getBookings();
            setBookings(res.data.data || res.data.bookings || []);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to sync reservations.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logoutStart());
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-surface grain text-stone-900 font-sans selection:bg-[#DC3558] selection:text-white">
            <Navbar />
            
            <main className="pt-40 pb-24 max-w-300 mx-auto px-6">
                <div className="mb-12">
                    <h1 className="text-6xl font-black tracking-tighter uppercase italic">Control Center.</h1>
                    <p className="text-stone-400 text-sm font-medium mt-2 uppercase tracking-widest">Session ID: SZ-{user?.id?.slice(-8).toUpperCase()}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="bg-white rounded-3xl border border-stone-100 p-3 space-y-1 shadow-sm">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab.id 
                                        ? 'bg-stone-900 text-white shadow-xl shadow-stone-900/10' 
                                        : 'text-stone-400 hover:bg-stone-50 hover:text-stone-900'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                            <div className="pt-3 mt-3 border-t border-stone-50">
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#DC3558] hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={18} />
                                    Terminate
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white rounded-[2.5rem] border border-stone-100 p-8 md:p-14 shadow-sm min-h-125"
                            >
                                {activeTab === 'identity' && (
                                    <div className="space-y-12">
                                        <section>
                                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#DC3558] mb-10 flex items-center gap-4">
                                                Identity Profile <div className="h-px flex-1 bg-stone-50" />
                                            </h2>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-300">Member Name</label>
                                                    <div className="relative border-b border-stone-100 pb-2 focus-within:border-stone-900 transition-colors">
                                                        <input 
                                                            className="w-full bg-transparent text-xl font-bold tracking-tight outline-none"
                                                            defaultValue={user?.name}
                                                        />
                                                        <Edit2 size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-200" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-300">Verified Channel</label>
                                                    <div className="relative border-b border-stone-100 pb-2 opacity-60">
                                                        <input 
                                                            disabled
                                                            className="w-full bg-transparent text-xl font-bold tracking-tight outline-none cursor-not-allowed"
                                                            defaultValue={user?.email}
                                                        />
                                                        <Check size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-green-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <button className="bg-stone-900 text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#DC3558] transition-all">
                                            Update Profile
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'reservations' && (
                                    <div className="space-y-10">
                                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#DC3558] mb-10 flex items-center gap-4">
                                            Active Passes <div className="h-px flex-1 bg-stone-50" />
                                        </h2>

                                        {isLoading ? (
                                            <div className="flex justify-center py-20 italic text-stone-300 animate-pulse uppercase tracking-widest text-[10px]">Syncing Vault...</div>
                                        ) : bookings.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <p className="text-5xl font-black italic text-stone-100 mb-6 uppercase tracking-tighter">Void.</p>
                                                <Link to="/events" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#DC3558] hover:italic transition-all">
                                                    Secure your first entry →
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {bookings.map((booking) => (
                                                    <div key={booking._id} className="flex items-center justify-between p-6 rounded-2xl border border-stone-50 hover:bg-stone-50 transition-colors group">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-12 h-12 bg-stone-900 text-white flex items-center justify-center rounded-xl text-xs font-bold">
                                                                {booking.seats?.[0]?.seatNumber?.[0] || 'T'}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black uppercase tracking-tight">{booking.event?.title}</h4>
                                                                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                                                    {new Date(booking.event?.date).toLocaleDateString()} // {booking.seats?.length} Units
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Link to={`/booking-confirmation/${booking._id}`} className="p-3 rounded-xl border border-stone-100 hover:bg-white transition-all text-stone-400 hover:text-stone-900">
                                                                <Download size={16} />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(activeTab === 'security' || activeTab === 'billing') && (
                                    <div className="h-64 flex flex-col items-center justify-center">
                                        <p className="text-stone-200 text-4xl font-black italic uppercase tracking-tighter">Locked.</p>
                                        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] mt-4">Module Sync in Progress</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;