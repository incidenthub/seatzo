import { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle, Armchair, ChevronRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import seatService from "../services/seat.service";

export default function SeatGrid({ eventId, seats = [], refresh, onSelectionChange, onCheckout }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [message, setMessage] = useState('');
  const isProcessing = useRef(false);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedSeats);
    }
  }, [selectedSeats]);

  const handleSeatClick = async (seat) => {
    if (isProcessing.current) return;
    
    const isSelected = selectedSeats.find((s) => s._id === seat._id);
    if (isSelected) {
      try {
        await seatService.releaseSeats(eventId, [seat.seatNumber]);
      } catch (err) {
        console.warn('Failed to release seat lock (may have expired):', err);
      }
      setSelectedSeats(prev => prev.filter(s => s._id !== seat._id));
      setMessage('SECTOR RELEASED');
      setTimeout(() => setMessage(''), 2000);
      await refresh?.();
      return;
    }

    if (seat.status !== 'AVAILABLE') {
      setMessage('UNAVAILABLE_SECTOR');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (selectedSeats.length >= 6) {
      setMessage('ALLOCATION_LIMIT_REACHED');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    isProcessing.current = true;
    try {
      await seatService.lockSeats(eventId, [seat.seatNumber]);
      setSelectedSeats(prev => [...prev, { ...seat, status: 'LOCKED' }]);
      setMessage('ALLOCATION_SECURED');
      setTimeout(() => setMessage(''), 2000);
      await refresh?.();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'LOCK_FAILURE';
      setMessage(errorMsg.toUpperCase());
      setTimeout(() => setMessage(''), 3000);
    } finally {
      isProcessing.current = false;
    }
  };

  const seatsByRow = {};
  seats.forEach(seat => {
    if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
    seatsByRow[seat.row].push(seat);
  });

  const total = selectedSeats.reduce((sum, s) => sum + (Number(s.currentPrice || s.price) || 0), 0);

  const getSeatStatusClass = (seat) => {
    const isSelected = selectedSeats.find(s => s._id === seat._id);
    if (isSelected) return 'bg-black text-white border-black';
    if (seat.status === 'AVAILABLE') return 'bg-stone-50 text-stone-900 border-stone-200 hover:border-black hover:bg-white';
    if (seat.status === 'LOCKED') return 'bg-amber-100 text-amber-700 border-amber-200 cursor-not-allowed';
    if (seat.status === 'BOOKED') return 'bg-stone-200 text-stone-400 border-transparent cursor-not-allowed';
    return 'bg-stone-100 text-stone-300 border-transparent cursor-not-allowed';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 selection:bg-black selection:text-white">
      <header className="text-center mb-16">
        <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic mb-4">Tactical Allocation.</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Select up to 6 units for precise authorization</p>
      </header>

      {/* Narrative Alerts */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={`flex items-center justify-center gap-3 p-4 mb-12 rounded-2xl border text-[10px] font-black tracking-[0.2em] uppercase ${
                message.includes('FAILURE') || message.includes('LIMIT') || message.includes('UNAVAILABLE') 
                ? 'bg-red-50 text-red-600 border-red-100' 
                : 'bg-stone-950 text-white border-white/5'
            }`}
          >
            {message.includes('FAILURE') ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tactical Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 p-6 bg-stone-50 rounded-4xl border border-stone-100">
        {[
          { label: 'Available', color: 'bg-stone-50 border-stone-200' },
          { label: 'Reserved', color: 'bg-amber-100 border-amber-200' },
          { label: 'Restricted', color: 'bg-stone-200' },
          { label: 'Validated', color: 'bg-black' }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4">
            <div className={`w-3 h-3 rounded-sm border ${item.color}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main Grid Interface */}
      <div className="relative p-12 md:p-20 bg-white rounded-[3rem] border border-stone-100 shadow-sm overflow-x-auto">
        <div className="min-w-125">
             {/* Stage/Screen Indicator */}
             <div className="w-full h-1 bg-linear-to-r from-transparent via-stone-200 to-transparent mb-20 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-2 bg-white text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">
                    AUTHORIZATION ZONE
                </div>
             </div>

             {/* Dynamic Seat Map */}
             <div className="flex flex-col gap-6">
                {Object.keys(seatsByRow).sort().map(row => (
                    <div key={row} className="flex gap-8 items-center justify-center">
                        <div className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-stone-300 border border-stone-100 rounded-lg">
                            {row}
                        </div>
                        <div className="flex gap-3">
                            {seatsByRow[row].map(seat => {
                                const isSelected = selectedSeats.find(s => s._id === seat._id);
                                return (
                                    <motion.button
                                        key={seat._id || seat.seatNumber}
                                        whileHover={seat.status === 'AVAILABLE' || isSelected ? { scale: 1.1 } : {}}
                                        whileTap={seat.status === 'AVAILABLE' || isSelected ? { scale: 0.95 } : {}}
                                        onClick={() => handleSeatClick(seat)}
                                        disabled={seat.status !== 'AVAILABLE' && !isSelected}
                                        className={`w-10 h-10 rounded-xl border text-[10px] font-black transition-all flex items-center justify-center relative group ${getSeatStatusClass(seat)}`}
                                    >
                                        <span className={isSelected ? 'relative z-10' : ''}>{seat.seatNumber.replace(row, '')}</span>
                                        {isSelected && <div className="absolute inset-0 bg-white opacity-10 animate-pulse rounded-xl" />}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                ))}
             </div>
        </div>
      </div>

      {/* High-Precision Summary Bar */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
            <motion.div 
               initial={{ y: 100, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 100, opacity: 0 }}
               className="mt-16 bg-zinc-950 p-10 md:p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Armchair size={150} />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <Zap size={14} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Atomic Lock Active</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {selectedSeats.map(s => (
                                <div key={s._id} className="px-4 py-2 bg-white/10 rounded-lg text-sm font-black tracking-tighter border border-white/5">
                                    {s.seatNumber}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 underline underline-offset-8">Total Valuation</span>
                         <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-display font-black tracking-tighter italic">₹{total.toLocaleString('en-IN')}</span>
                            <span className="text-stone-500 text-[10px] font-black uppercase">INR</span>
                         </div>
                    </div>

                    {onCheckout && selectedSeats.length > 0 && (
                        <button
                            onClick={() => onCheckout(selectedSeats, total)}
                            className="group flex items-center gap-6 px-10 py-6 bg-white text-black rounded-3xl hover:bg-stone-100 transition-all overflow-hidden"
                        >
                        <span className="font-black uppercase tracking-widest text-xs">Buy Tickets</span>
                            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                <ChevronRight size={18} />
                            </div>
                        </button>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
