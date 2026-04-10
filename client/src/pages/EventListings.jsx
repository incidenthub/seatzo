import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import eventService from '../services/event.service';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const EventListings = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    sortBy: 'date',
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eventService.getAllEvents(filters);
      setEvents(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['movie', 'concert', 'sports', 'theatre', 'standup'];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-40 max-w-[1400px] mx-auto px-6 pb-40">
        <header className="mb-20">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-[clamp(3rem,6vw,5rem)] leading-none font-black tracking-tighter mb-8 italic">
                EXPLORE <br /> 
                <span className="text-secondary-foreground/20">THE SCENE.</span>
              </h1>
              <p className="text-stone-400 font-bold uppercase tracking-[0.2em] text-xs">
                {events.length} Curation(s) available for your selection
              </p>
            </motion.div>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-8 items-end justify-between mb-20 border-b border-stone-100 pb-12">
            <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setFilters(prev => ({...prev, category: ''}))}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${!filters.category ? 'bg-black text-white border-black' : 'border-stone-200 text-stone-400 hover:border-black'}`}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setFilters(prev => ({...prev, category: cat}))}
                      className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filters.category === cat ? 'bg-black text-white border-black' : 'border-stone-200 text-stone-400 hover:border-black'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="w-full md:w-auto relative group">
                <Search className="absolute left-0 bottom-4 text-stone-300 group-focus-within:text-black transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder="SEARCH EVENTS..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                  className="pl-8 pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-xs font-black tracking-widest uppercase w-full md:w-64 placeholder:text-stone-200"
                />
            </div>
        </div>

        {/* Content */}
        {isLoading ? (
            <div className="py-40 flex justify-center">
                <LoadingSpinner />
            </div>
        ) : error ? (
            <div className="py-20 text-center text-red-500 font-bold uppercase tracking-widest text-xs border border-red-50 bg-red-50/50 rounded-3xl">
                Error: {error}
            </div>
        ) : events.length === 0 ? (
            <div className="py-40 text-center">
                <p className="text-stone-300 text-6xl font-black italic mb-4">VOID.</p>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">No events found in this category.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                {events.map((event, i) => (
                    <motion.div
                      key={event._id}
                      initial={{ y: 40, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: (i % 3) * 0.1 }}
                      viewport={{ once: true }}
                    >
                        <Link to={`/events/${event._id}`} className="group block">
                            <div className="aspect-[4/5] bg-stone-100 overflow-hidden mb-8 relative">
                                <motion.img 
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                  src={event.posterUrl || `https://source.unsplash.com/featured/?${event.category},event&sig=${event._id}`}
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-6 left-6 px-4 py-1.5 bg-white text-[10px] font-black uppercase tracking-widest">
                                    {event.category}
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-black uppercase tracking-tighter w-2/3 group-hover:italic transition-all">
                                    {event.title}
                                </h3>
                                <span className="text-xl font-medium tracking-tight">₹{event.basePrice}</span>
                            </div>

                            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} />
                                    <span>{event.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} />
                                    <span>{new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EventListings;
