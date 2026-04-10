import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSeats] = useState([
    { seatNumber: 'A1', price: 1200 },
    { seatNumber: 'A2', price: 1200 }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = useMemo(() => selectedSeats.reduce((sum, seat) => sum + seat.price, 0), [selectedSeats]);
  const fees = Math.round(totalAmount * 0.12);
  const finalTotal = totalAmount + fees;

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      navigate(`/booking-confirmation/${id}?seats=${selectedSeats.map(s => s.seatNumber).join(',')}&total=${finalTotal}`);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-40 max-w-[1400px] mx-auto px-6 pb-40">
        <div className="flex flex-col lg:flex-row gap-24 items-start">
            
            {/* Left: Secure Form */}
            <div className="w-full lg:w-[60%] order-2 lg:order-1">
                <header className="mb-16">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        <ArrowLeft size={14} /> Back to curation
                    </button>
                    <h1 className="text-6xl font-black tracking-tighter uppercase italic">Secure Checkout.</h1>
                </header>

                <form onSubmit={handlePayment} className="space-y-12">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="group col-span-2">
                           <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 group-focus-within:text-black">Card Number</label>
                           <input 
                             required
                             placeholder="0000 0000 0000 0000"
                             className="w-full pb-4 bg-transparent border-b border-stone-100 outline-none focus:border-black transition-all text-xl font-bold tracking-widest placeholder:text-stone-100"
                           />
                        </div>

                        <div className="group">
                           <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 group-focus-within:text-black">Expiry</label>
                           <input required placeholder="MM / YY" className="w-full pb-4 bg-transparent border-b border-stone-100 outline-none focus:border-black transition-all text-xl font-bold placeholder:text-stone-100" />
                        </div>

                        <div className="group">
                           <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 group-focus-within:text-black">CVV</label>
                           <input required type="password" placeholder="***" className="w-full pb-4 bg-transparent border-b border-stone-100 outline-none focus:border-black transition-all text-xl font-bold placeholder:text-stone-100" />
                        </div>
                    </div>

                    <div className="pt-12">
                        <button
                          disabled={isProcessing}
                          className="w-full group py-6 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:gap-6 transition-all disabled:opacity-50"
                        >
                            {isProcessing ? 'Authenticating' : `Authorize ₹${finalTotal}`}
                            {isProcessing ? (
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                                />
                            ) : <CreditCard size={18} />}
                        </button>
                    </div>

                    <div className="flex items-center gap-4 py-8 border-t border-stone-50">
                        <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300">
                            <ShieldCheck size={20} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-relaxed">
                            Payment encrypted by SEATZO SECURE™ • PCI DSS Level 1 Certified <br />
                            Atomic seating lock active for 15:00 minutes.
                        </p>
                    </div>
                </form>
            </div>

            {/* Right: Summary Side */}
            <div className="w-full lg:w-[40%] bg-stone-50 p-12 lg:p-16 rounded-[3rem] order-1 lg:order-2">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-12">Reservation Summary</h2>
                
                <div className="space-y-8">
                    {selectedSeats.map(seat => (
                        <div key={seat.seatNumber} className="flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center font-black group-hover:bg-black group-hover:text-white transition-colors">
                                    {seat.seatNumber}
                                </div>
                                <span className="font-bold text-lg">VIP Allocation</span>
                            </div>
                            <span className="font-bold">₹{seat.price}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-12 border-t border-stone-200/50 space-y-4">
                    <div className="flex justify-between items-center text-stone-400 text-[10px] font-black uppercase tracking-widest">
                        <span>Base Total</span>
                        <span>₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-stone-400 text-[10px] font-black uppercase tracking-widest">
                        <span>Convenience Fee (12%)</span>
                        <span>₹{fees}</span>
                    </div>
                    <div className="flex justify-between items-center pt-8">
                        <span className="font-black uppercase tracking-tighter text-xl italic">Final Balance</span>
                        <span className="text-4xl font-black tracking-tighter">₹{finalTotal}</span>
                    </div>
                </div>

                <div className="mt-12 bg-white/50 p-6 rounded-2xl border border-stone-200/30">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 leading-relaxed text-center">
                        CONFIRMING THIS RESERVATION WILL INITIATE AN ATOMIC SEAT LOCK. ONCE AUTHORIZED, THE ALLOCATION IS PERMANENT.
                    </p>
                </div>
            </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
