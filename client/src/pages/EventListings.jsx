import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import eventService from '../services/event.service';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const EventListings = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', search: '' });

  // Simplified filter logic
  const categories = ['movie', 'concert', 'sports', 'theatre', 'standup'];

  useEffect(() => {
    // Simulated fetch - replace with your actual service call
    setIsLoading(true);
    eventService.getAllEvents(filters)
      .then(res => setEvents(res.data?.events || []))
      .finally(() => setIsLoading(false));
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      
      <main className="pt-40 max-w-[1600px] mx-auto px-6 md:px-12 pb-32">
        {/* Editorial Header */}
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[12vw] lg:text-[7vw] font-light leading-[0.8] tracking-tighter">
              Curated<span className="text-[#DC3558]">.</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 mt-6">
              {events.length} active experiences live now
            </p>
          </motion.div>

          {/* Minimal Filter Bar */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilters({ ...filters, category: '' })}
              className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${!filters.category ? 'bg-stone-950 text-white' : 'bg-stone-200/50 text-stone-900 hover:bg-stone-200'}`}
            >
              All Access
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilters({ ...filters, category: cat })}
                className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filters.category === cat ? 'bg-[#DC3558] text-white' : 'bg-stone-200/50 text-stone-900 hover:bg-stone-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-stone-400 text-xs font-bold uppercase tracking-widest animate-pulse">
            Syncing Live Data...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {events.map((event, i) => (
              <motion.div 
                key={event._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <Link to={`/events/${event._id}`} className="block">
                  {/* Image Container with Depth */}
                  <div className="aspect-[3/4] bg-stone-200 rounded-[2rem] overflow-hidden relative shadow-sm group-hover:shadow-2xl transition-all duration-700 mb-6">
                    <img 
                      src={event.posterUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {event.category}
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold tracking-tight">{event.title}</h3>
                      <ArrowUpRight className="text-stone-300 group-hover:text-[#DC3558] transition-colors" size={20} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      {event.city} • {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-sm font-bold pt-2 italic font-serif">₹{event.basePrice}</p>
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