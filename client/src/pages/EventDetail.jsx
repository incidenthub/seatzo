import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Tag, AlertCircle, ArrowLeft, ArrowRight, 
  Clock, ShieldCheck, BadgeCheck, Zap, TrendingUp, BarChart3, 
  Info, CheckCircle, Share2, Heart, Navigation 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import eventService from '../services/event.service';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchEvent();
    const interval = setInterval(fetchEvent, 30000); // Dynamic price update
    return () => clearInterval(interval);
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventService.getEventById(id);
      const eventData = response.data.event || response.data;
      setEvent(eventData);
      calculatePricing(eventData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Event offline.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePricing = (eventData) => {
    if (!eventData) return;
    const basePrice = Number(eventData.basePrice) || 0;
    let price = basePrice;
    const occupancyRate = eventData.totalSeats > 0 ? (1 - (eventData.availableSeats / eventData.totalSeats)) : 0;
    
    // Simulating surge logic matched with backend patterns
    if (eventData.pricingRules?.enableSurge) {
        if (occupancyRate > 0.8) price *= 1.5;
        else if (occupancyRate > 0.5) price *= 1.25;
        
        // Ensure it doesn't exceed max multiplier
        const maxPrice = basePrice * (eventData.pricingRules.maxMultiplier || 2);
        price = Math.min(price, maxPrice);
    }
    
    setPricing({ currentPrice: Math.round(price) });
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  
  if (error || !event) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="max-w-md"
            >
                <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-stone-100">
                    <AlertCircle size={40} className="text-stone-300" />
                </div>
                <h2 className="text-4xl font-display font-black tracking-tighter uppercase mb-4 text-balance">{error || 'Event Not Found'}</h2>
                <p className="text-stone-500 mb-10 font-medium">The curation you're looking for might have been archived or moved to a different sector.</p>
                <Link to="/events" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform">
                    <ArrowLeft size={14} /> Back to curation
                </Link>
            </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const occupancyPercent = Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100);

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white">
      <Navbar />
      
      <main className="flex flex-col lg:flex-row relative">
        {/* Left Side: Cinematic Media Section */}
        <div className="w-full lg:w-3/5 h-[60vh] lg:h-screen lg:sticky lg:top-0 bg-stone-900 overflow-hidden">
             {event.posterUrl ? (
               <motion.img 
                 initial={{ scale: 1.2, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                 src={event.posterUrl}
                 alt={event.title}
                 className="w-full h-full object-cover opacity-80"
               />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-stone-800 via-stone-900 to-black flex items-center justify-center relative">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-white/10 text-[20vw] font-black uppercase tracking-tighter italic select-none"
                  >
                    {event.category}
                  </motion.h1>
               </div>
             )}
             
             {/* Dynamic Overlays */}
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
             <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent lg:hidden" />

             {/* Content Overlay */}
             <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white">
                 <motion.div 
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   className="flex flex-wrap gap-3 mb-8"
                 >
                    <span className="px-5 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">{event.category}</span>
                    <span className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                        <MapPin size={10} />
                        {event.city}
                    </span>
                 </motion.div>
                 
                 <motion.h1 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-[0.85] uppercase text-balance pr-12"
                 >
                    {event.title}
                 </motion.h1>

                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 flex items-center gap-12 border-t border-white/10 pt-12 hidden lg:flex"
                 >
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">Venue</span>
                        <span className="text-xl font-bold">{event.venue}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">Experience</span>
                        <span className="text-xl font-bold italic">{formattedDate}</span>
                    </div>
                    <div className="ml-auto flex gap-4">
                        <button 
                          onClick={() => setIsLiked(!isLiked)}
                          className={`w-14 h-14 rounded-full border border-white/20 flex items-center justify-center transition-all ${isLiked ? 'bg-white text-black border-white' : 'hover:bg-white/10'}`}
                        >
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                        <button className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all">
                            <Share2 size={20} />
                        </button>
                    </div>
                 </motion.div>
             </div>
        </div>

        {/* Right Side: Details & High-Conversion Panel */}
        <div className="w-full lg:w-2/5 min-h-screen bg-white flex flex-col">
            <div className="px-6 py-10 md:px-12 md:py-20 lg:p-20">
                <Link to="/events" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-20 group hover:text-black transition-colors">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                    Return to gallery
                </Link>

                {/* Mobile Header Info */}
                <div className="lg:hidden mb-16">
                    <p className="text-stone-500 font-medium leading-relaxed text-lg italic mb-6">
                        {event.description}
                    </p>
                    <div className="flex flex-col gap-6 p-8 bg-stone-50 rounded-[2rem]">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0">
                                <Calendar size={18} className="text-white" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-1">Date</span>
                                <span className="font-bold text-lg">{formattedDate}</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-stone-200 rounded-xl flex items-center justify-center shrink-0">
                                <MapPin size={18} className="text-black" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-1">Location</span>
                                <span className="font-bold text-lg">{event.venue}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dynamic Booking Card */}
                <div className="relative group overflow-hidden bg-black rounded-[3rem] p-10 md:p-12 mb-16 text-white shadow-2xl shadow-black/20">
                    <div className="absolute top-0 right-0 p-8">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center"
                        >
                            <Zap size={24} className="text-white/20" />
                        </motion.div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Live Demand Engine</span>
                        </div>

                        <div className="flex flex-col mb-12">
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">Starting From</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-7xl font-display font-black tracking-tighter leading-none italic">
                                    ₹{pricing?.currentPrice?.toLocaleString('en-IN') || (Number(event.basePrice) || 0).toLocaleString('en-IN')}
                                </span>
                                <span className="text-stone-500 text-sm font-bold uppercase tracking-widest italic">INR</span>
                            </div>
                        </div>

                        <div className="space-y-6 mb-12">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Inventory Status</span>
                                <span className="text-xs font-bold text-stone-300">{event.availableSeats > 0 ? `${occupancyPercent}% Reserved` : 'Sold Out'}</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${occupancyPercent}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                    className={`h-full ${occupancyPercent > 80 ? 'bg-accent' : 'bg-white'}`}
                                />
                            </div>
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                                {event.availableSeats} of {event.totalSeats} seats remaining
                            </p>
                        </div>

                        {event.availableSeats > 0 ? (
                            <Link 
                                to={token ? `/events/${id}/book/new` : '/login'}
                                className="w-full flex items-center justify-between p-6 bg-white text-black rounded-2xl group/btn hover:bg-stone-100 transition-all overflow-hidden relative"
                            >
                                <span className="font-black uppercase tracking-widest text-sm relative z-10">
                                    {token ? 'Configure Allocation' : 'Authentication Required'}
                                </span>
                                <div className="relative z-10 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover/btn:bg-black group-hover/btn:text-white transition-all">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <button disabled className="w-full p-6 bg-stone-800 text-stone-500 rounded-2xl font-black uppercase tracking-widest text-sm cursor-not-allowed border border-white/5">
                                Market Closed — Allocation Exhausted
                            </button>
                        )}
                    </div>
                </div>

                {/* Experience Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                    <div className="p-8 rounded-[2rem] border border-stone-100 bg-stone-50/50 hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center">
                                <Clock size={20} className="text-black" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Timing</span>
                        </div>
                        <p className="font-bold text-lg mb-1">{formattedDate}</p>
                        <p className="text-stone-500 text-sm font-medium">Doors Open 18:30 IST</p>
                    </div>

                    <div className="p-8 rounded-[2rem] border border-stone-100 bg-stone-50/50 hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center">
                                <Navigation size={20} className="text-black" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Location</span>
                        </div>
                        <p className="font-bold text-lg mb-1 truncate">{event.venue}</p>
                        <p className="text-stone-500 text-sm font-medium italic uppercase tracking-widest">{event.city}</p>
                    </div>

                    <div className="md:col-span-2 p-8 rounded-[2rem] border border-stone-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center">
                                <ShieldCheck size={20} className="text-black" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Security & Access</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {['E-Ticket Required', 'Verification Check', 'No Re-entry', '18+ Event'].map((tag, i) => (
                                <span key={i} className="px-4 py-2 bg-stone-100 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
                                    <CheckCircle size={10} className="text-black" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cinematic Narrative - Description */}
                <div className="mb-24">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8 ml-1">Event Narrative</label>
                    <div className="relative">
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-black via-stone-200 to-transparent rounded-full" />
                        <p className="text-stone-600 font-medium leading-[1.8] text-xl md:text-2xl text-balance italic">
                            "{event.description}"
                        </p>
                    </div>
                </div>

                {/* Dynamic Pricing Engine Visualization */}
                <div className="mb-24 p-10 bg-stone-50 rounded-[2.5rem] border border-stone-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <BarChart3 size={100} />
                    </div>
                    
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-10">Pricing Algorithm</label>
                    <div className="grid grid-cols-1 gap-8 relative z-10">
                        <div className="flex justify-between items-center py-4 border-b border-stone-200">
                            <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Market Entry Price</span>
                            <span className="text-xl font-black italic">₹{Number(event.basePrice).toLocaleString('en-IN')}</span>
                        </div>

                        {event.pricingRules && (
                            <>
                                <div className="flex justify-between items-center py-4 border-b border-stone-200">
                                    <div className="flex items-center gap-2">
                                        <Zap size={14} className="text-accent" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Surge Multiplier (Max)</span>
                                    </div>
                                    <span className="text-xl font-black italic">{event.pricingRules.maxMultiplier}x</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-stone-100">
                                    <Info size={16} className="text-stone-400" />
                                    <p className="text-[10px] uppercase font-black tracking-widest text-stone-500">
                                        {event.pricingRules.enableSurge ? 'Smart surge monitoring active' : 'Stable pricing model engaged'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Organiser Identity */}
                <div className="mb-24">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8">Authorizing Entity</label>
                    <div className="flex items-center gap-6 p-8 bg-zinc-950 rounded-[2rem] text-white">
                        <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shrink-0">
                            <Users size={28} className="text-black" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-display font-black text-2xl uppercase tracking-tighter">{event.organiser?.name || 'Authorized Partner'}</h3>
                                <BadgeCheck size={20} className="text-blue-400" />
                            </div>
                            <p className="text-stone-500 text-xs font-bold uppercase tracking-[0.2em]">{event.organiser?.email || 'verified_entity@seatzo.io'}</p>
                        </div>
                    </div>
                </div>

                {/* Social Tags */}
                {event.tags && event.tags.length > 0 && (
                    <div className="mb-24">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8 text-center md:text-left">Identified Tags</label>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            {event.tags.map((tag, idx) => (
                                <span key={idx} className="px-6 py-3 bg-white border border-stone-100 shadow-sm text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all cursor-default">
                                    # {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Fine Print / Timeline */}
            <div className="px-12 py-10 md:px-20 border-t border-stone-100">
                <div className="flex flex-wrap gap-12 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    <div>
                        <span className="block mb-2 text-[8px] font-black opacity-30">Published On</span>
                        {new Date(event.createdAt).toLocaleDateString('en-GB')}
                    </div>
                    <div>
                        <span className="block mb-2 text-[8px] font-black opacity-30">Network Status</span>
                        Ready — High Authority
                    </div>
                    <div className="ml-auto">
                        © 2026 SEATZO ECOSYSTEM
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* Floating Action Bar for Mobile */}
      <AnimatePresence>
        {event.availableSeats > 0 && (
            <motion.div 
               initial={{ y: 100 }}
               animate={{ y: 0 }}
               exit={{ y: 100 }}
               className="lg:hidden fixed bottom-0 left-0 right-0 p-6 z-40 bg-white/10 backdrop-blur-2xl border-t border-white/5"
            >
                <Link 
                    to={token ? `/events/${id}/book/new` : '/login'}
                    className="w-full h-16 bg-black text-white rounded-2xl flex items-center justify-center gap-4 shadow-2xl shadow-black/40"
                >
                    <span className="font-black uppercase tracking-[0.2em] text-xs">Initialize Booking</span>
                    <Zap size={16} className="text-accent" />
                    <span className="text-lg font-black tracking-tighter">₹{pricing?.currentPrice || (Number(event.basePrice) || 0)}</span>
                </Link>
            </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default EventDetail;
