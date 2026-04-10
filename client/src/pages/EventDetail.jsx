import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag, AlertCircle, ArrowLeft, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchEvent();
    const interval = setInterval(fetchEvent, 30000); // Dynamic price update
    return () => clearInterval(interval);
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventService.getEventById(id);
      setEvent(response.data);
      calculatePricing(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Event offline.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePricing = (eventData) => {
    let price = eventData.basePrice;
    const occupancyRate = 1 - (eventData.availableSeats / eventData.totalSeats);
    if (occupancyRate > 0.8) price *= 1.5;
    else if (occupancyRate > 0.6) price *= 1.2;
    setPricing({ currentPrice: Math.round(price) });
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error || !event) return <div className="min-h-screen flex items-center justify-center text-xs font-black uppercase tracking-[0.3em]">{error || 'Event Not Found'}</div>;

  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const occupancyPercent = Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 lg:pt-0 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side: Cinematic Poster */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-screen sticky top-0 bg-stone-100 overflow-hidden">
             <motion.img 
               initial={{ scale: 1.1, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
               src={event.posterUrl || `https://source.unsplash.com/featured/?${event.category},event`}
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent hidden lg:block" />
             <div className="absolute bottom-12 left-12 right-12 text-white hidden lg:block">
                 <div className="flex gap-4 mb-6">
                    <span className="px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">{event.category}</span>
                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">{event.city}</span>
                 </div>
                 <h1 className="text-7xl font-black tracking-tighter leading-[0.9] italic uppercase">{event.title}</h1>
             </div>
        </div>

        {/* Right Side: Details & Action */}
        <div className="w-full lg:w-1/2 px-8 py-12 md:px-20 md:py-32 lg:min-h-screen flex flex-col overflow-y-auto">
            <Link to="/events" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-12 hover:gap-4 transition-all">
                <ArrowLeft size={14} /> Back to curation
            </Link>

            <div className="lg:hidden mb-8">
                <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">{event.title}</h1>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">{event.category} — {event.city}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-12 mb-16 border-b border-stone-100 pb-16">
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">Date & Time</label>
                   <div className="flex gap-3">
                      <Calendar size={18} className="text-black" />
                      <span className="font-bold text-lg">{formattedDate}</span>
                   </div>
                   <div className="flex gap-3 mt-2">
                      <Clock size={18} className="text-stone-300" />
                      <span className="text-stone-400 font-medium">Starts 19:00 IST</span>
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">Location</label>
                   <div className="flex gap-3">
                      <MapPin size={18} className="text-black" />
                      <span className="font-bold text-lg truncate">{event.venue}</span>
                   </div>
                   <p className="text-stone-400 font-medium mt-1 pl-7">{event.city}</p>
                </div>

                <div className="col-span-2">
                   <div className="flex justify-between items-end mb-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Available Inventory</label>
                      <span className="text-xs font-bold">{occupancyPercent}% Booked</span>
                   </div>
                   <div className="w-full h-1 bg-stone-100 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${occupancyPercent}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-black" 
                      />
                   </div>
                   <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-4">
                      {event.availableSeats} of {event.totalSeats} seats remaining in total
                   </p>
                </div>
            </div>

            {/* Booking Card */}
            <div className="bg-stone-50 p-10 rounded-[2.5rem] mb-12">
                <div className="flex justify-between items-center mb-8">
                    <span className="text-xs font-black uppercase tracking-widest">Entry Passes</span>
                    <div className="flex items-center gap-2 text-green-600">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Venue</span>
                    </div>
                </div>
                
                <div className="flex items-baseline gap-2 mb-10">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest translate-y-[-12px]">Starts At</span>
                    <span className="text-6xl font-black tracking-tighter">₹{pricing?.currentPrice || event.basePrice}</span>
                </div>

                {event.availableSeats > 0 ? (
                    <Link 
                      to={token ? `/events/${id}/book` : '/login'}
                      className="w-full group py-6 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:gap-6 transition-all"
                    >
                        {token ? 'Configure Seats' : 'Authenticate to Book'}
                        <ArrowRight size={18} />
                    </Link>
                ) : (
                    <div className="w-full py-6 bg-stone-200 text-stone-500 rounded-full font-black uppercase tracking-widest text-xs text-center cursor-not-allowed">
                        Allocation Exhausted
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="mb-20">
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-6">Brief Details</label>
                <p className="text-stone-500 font-medium leading-[1.8] text-lg">
                    {event.description}
                </p>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;
