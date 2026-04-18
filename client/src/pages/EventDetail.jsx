import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Info, Share2, Heart, 
  ChevronRight, Star, Clock, Languages, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import eventService from '../services/event.service';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventService.getEventById(id);
      const eventData = response.data.event || response.data;
      setEvent(eventData);
      setPricing({ currentPrice: Math.round(eventData.basePrice) });
      setError(null);
    } catch (err) {
      setError('Event details currently unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  
  if (error || !event) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
           <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-4">{error || 'VOIDS.'}</h2>
           <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-8">The requested protocol is unavailable.</p>
           <Link to="/events" className="px-8 py-3 bg-black text-white rounded-lg font-bold text-xs uppercase tracking-widest">
              Back to Catalog
           </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F5F5F5] selection:bg-[#F84464] selection:text-white">
      <Navbar />
      
      {/* ─── Hero Banner Section (BMS Style) ─── */}
      <div className="relative w-full h-[480px] overflow-hidden bg-black">
        {/* Blurred Background */}
        <div className="absolute inset-0 opacity-40 blur-2xl scale-110">
            <img src={event.posterUrl} alt="" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative max-w-7xl mx-auto h-full flex items-center px-6 md:px-12 gap-10 z-10">
            {/* Poster Card */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="hidden md:block w-64 h-[400px] shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10"
            >
                <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
            </motion.div>

            {/* Event Info */}
            <div className="text-white flex-1 space-y-6">
                <div className="flex items-center gap-2">
                    <span className="bg-[#333] text-[10px] font-bold px-2 py-1 rounded">PREMIERE</span>
                    <span className="bg-[#F84464] text-[10px] font-bold px-2 py-1 rounded">NEW</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{event.title}</h1>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-[#222] px-3 py-2 rounded-lg">
                        <Star className="text-[#F84464]" fill="#F84464" size={18} />
                        <span className="font-bold text-lg">9.2/10</span>
                        <span className="text-xs text-stone-400 ml-2">45K Votes</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                   <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded text-sm font-medium">{event.category}</div>
                   <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded text-sm font-medium">2D, IMAX 2D</div>
                   <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded text-sm font-medium">English, Hindi</div>
                </div>

                <p className="text-lg font-medium">
                    {formattedDate} • {event.venue}
                </p>

                <Link 
                    to={token ? `/events/${id}/book/new` : '/login'}
                    className="flex items-center justify-center gap-2 bg-[#F84464] hover:bg-[#d63a56] transition-colors px-12 py-4 rounded-xl font-bold text-lg text-white"
                >
                    Book Tickets
                </Link>
            </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Details */}
        <div className="flex-1 space-y-12">
            <section>
                <h2 className="text-2xl font-bold text-stone-900 mb-4">About the Event</h2>
                <p className="text-stone-600 leading-relaxed text-lg">
                    {event.description}
                </p>
            </section>

            <div className="h-[1px] bg-stone-200" />

            <section>
                <h2 className="text-2xl font-bold text-stone-900 mb-6">Venue & Safety</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border border-stone-100">
                        <MapPin className="text-[#F84464] shrink-0" />
                        <div>
                            <h4 className="font-bold">{event.venue}</h4>
                            <p className="text-sm text-stone-500">{event.city}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border border-stone-100">
                        <ShieldCheck className="text-green-500 shrink-0" />
                        <div>
                            <h4 className="font-bold">Safety Measures</h4>
                            <p className="text-sm text-stone-500">Sanitized Venue, Mask Required</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        {/* Right Column: Sidebar (BMS Offers/Sidebar Style) */}
        <div className="w-full lg:w-[350px] space-y-6">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Offers For You</h3>
                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100 mb-3">
                    <Info size={18} className="text-blue-600 shrink-0 mt-1" />
                    <p className="text-xs text-blue-800 font-medium">
                        Unlock 25% off on food and beverages with select credit cards.
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">Share this event</span>
                    <div className="flex gap-4">
                        <Share2 size={20} className="text-stone-600 cursor-pointer hover:text-[#F84464]" />
                        <Heart 
                           size={20} 
                           fill={isLiked ? "#F84464" : "none"} 
                           className={`cursor-pointer ${isLiked ? "text-[#F84464]" : "text-stone-600"}`} 
                           onClick={() => setIsLiked(!isLiked)}
                        />
                    </div>
                </div>
                <div className="p-4 bg-stone-50 rounded-lg border border-dashed border-stone-300">
                    <p className="text-[11px] font-bold text-stone-500 uppercase text-center">
                        Organizer: {event.organiser?.name || 'Authorized Partner'}
                    </p>
                </div>
            </div>
        </div>
      </main>

      {/* Fixed Bottom Bar for Mobile Booking */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 flex items-center justify-between z-50">
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase">Starting From</p>
            <p className="text-xl font-bold">₹{pricing?.currentPrice?.toLocaleString('en-IN')}</p>
          </div>
          <Link 
            to={token ? `/events/${id}/book/new` : '/login'}
            className="bg-[#F84464] text-white px-8 py-3 rounded-lg font-bold"
          >
            Book Tickets
          </Link>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail;