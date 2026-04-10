import React, { useState, useEffect } from 'react';
import { Download, Share2, Home, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const BookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const seats = searchParams.get('seats')?.split(',') || [];
  const total = searchParams.get('total') || 0;
  const bookingId = 'SZ' + Math.random().toString(36).substr(2, 6).toUpperCase();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-40 max-w-[800px] mx-auto px-6 pb-40">
        <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-stone-100"
            >
                <div className="w-12 h-12 bg-black rounded-lg rotate-45 flex items-center justify-center">
                    <ShieldCheck className="text-white -rotate-45" size={24} />
                </div>
            </motion.div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic mb-4">CONFIRMED.</h1>
            <p className="text-stone-400 font-bold uppercase tracking-[0.2em] text-xs">Allocation Secured & Verified.</p>
        </div>

        {/* The Ticket Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-black text-white p-12 md:p-16 rounded-[3rem] relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between gap-12 items-start relative z-10">
                <div className="space-y-10">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Reservation ID</label>
                        <span className="text-3xl font-black tracking-tighter italic">{bookingId}</span>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Allocated Units</label>
                        <div className="flex gap-4">
                            {seats.map(s => (
                                <span key={s} className="px-5 py-2 bg-white/10 rounded-xl font-black text-sm italic">{s}</span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Total Balance Authorised</label>
                        <span className="text-4xl font-black tracking-tighter">₹{total}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-3xl aspect-square flex flex-col items-center justify-center text-black w-full md:w-48">
                    <div className="w-full flex-1 flex flex-wrap gap-1">
                        {[...Array(64)].map((_, i) => (
                           <div key={i} className={`w-3 h-3 ${Math.random() > 0.4 ? 'bg-black' : 'bg-stone-50'}`} />
                        ))}
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest mt-4">Security QR</p>
                </div>
            </div>

            <div className="mt-16 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between gap-8 items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Access Pass</span>
                </div>
                <div className="flex gap-6">
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity">
                        <Download size={14} /> PDF Ticket
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity">
                        <Share2 size={14} /> Distribute
                    </button>
                </div>
            </div>
        </motion.div>

        {/* Navigation */}
        <div className="mt-12 flex flex-col md:flex-row gap-4 items-center justify-center">
            <Link 
              to="/dashboard" 
              className="w-full md:w-auto px-10 py-5 border border-stone-200 rounded-full font-black uppercase tracking-widest text-xs hover:bg-stone-50 transition-colors text-center"
            >
                Go to Dashboard
            </Link>
            <Link 
              to="/" 
              className="w-full md:w-auto px-10 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:gap-6 transition-all"
            >
                Browse More Events <ArrowRight size={16} />
            </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;
