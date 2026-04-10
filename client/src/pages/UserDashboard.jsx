import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Download, ArrowRight, User, Settings, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const UserDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [bookings, setBookings] = useState([
    {
      _id: '1',
      eventTitle: 'COLDPLAY: MUSIC OF THE SPHERES',
      city: 'MUMBAI',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      seats: ['A1', 'A2', 'A3'],
      totalAmount: 12500,
      status: 'CONFIRMED',
      bookingId: 'SZ-882910'
    },
    {
      _id: '2',
      eventTitle: 'OPPENHEIMER: SPECIAL SCREENING',
      city: 'DELHI',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      seats: ['J12'],
      totalAmount: 1200,
      status: 'COMPLETED',
      bookingId: 'SZ-110293'
    }
  ]);

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const getStatusStyles = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-white text-black border-black';
      case 'COMPLETED': return 'bg-stone-100 text-stone-400 border-stone-200';
      case 'CANCELLED': return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-stone-50 text-stone-500 border-stone-100';
    }
  };

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
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white italic font-black">R</div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Member Since 2024</span>
                </div>
                <h1 className="text-6xl font-black tracking-tighter uppercase italic">Control Center.</h1>
            </motion.div>
            
            <div className="flex gap-4">
                <button className="px-6 py-3 border border-stone-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center gap-2">
                    <Settings size={14} /> Account Settings
                </button>
                <button className="px-6 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-black/20">
                    <User size={14} /> My Profile
                </button>
            </div>
        </header>

        {/* Dynamic Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
            {[
                { label: 'Active Reservations', val: bookings.filter(b => b.status === 'CONFIRMED').length, icon: <Ticket /> },
                { label: 'Curation History', val: bookings.length, icon: <Calendar /> },
                { label: 'Total Invested', val: `₹${bookings.reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}`, icon: <ShieldCheck /> }
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
                <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest italic">{bookings.length} Item(s) found</span>
            </div>

            <div className="space-y-6">
                {bookings.map((booking, i) => (
                    <motion.div 
                        key={booking._id} 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative flex flex-col md:flex-row items-center justify-between p-8 rounded-[2rem] hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100"
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-10 w-full">
                            {/* Visual ID */}
                            <div className="w-16 h-16 bg-black text-white flex flex-col items-center justify-center rounded-2xl shrink-0 group-hover:rotate-6 transition-transform">
                                <span className="text-[8px] font-black uppercase tracking-tighter border-b border-white/20 pb-1 mb-1">Pass</span>
                                <span className="text-xs font-black">{booking.seats[0]}</span>
                            </div>

                            {/* Info */}
                            <div className="space-y-2 flex-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 italic mb-2 block">{booking.bookingId}</span>
                                <h4 className="text-2xl font-black tracking-tighter uppercase">{booking.eventTitle}</h4>
                                <div className="flex items-center gap-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest pt-2">
                                    <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(booking.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                                    <div className="flex items-center gap-1.5"><MapPin size={12} /> {booking.city}</div>
                                    <div className="flex items-center gap-1.5"><Ticket size={12} /> {booking.seats.length} UNIT(S)</div>
                                </div>
                            </div>

                            {/* Pricing & Status */}
                            <div className="flex items-center gap-8 text-right w-full md:w-auto mt-6 md:mt-0 justify-between md:justify-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Balanced Paid</p>
                                    <p className="text-xl font-black tracking-tighter italic">₹{booking.totalAmount.toLocaleString()}</p>
                                </div>
                                <div className={`px-4 py-2 border rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyles(booking.status)}`}>
                                    {booking.status}
                                </div>
                                <button className="p-4 bg-white border border-stone-200 rounded-2xl hover:bg-black hover:text-white transition-all">
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
