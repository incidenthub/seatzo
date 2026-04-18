import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, ChevronRight, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import eventService from '../services/event.service';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const EventListings = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', search: '' });

  const categories = ['Movies', 'Stream', 'Events', 'Plays', 'Sports', 'Activities'];

  useEffect(() => {
    setIsLoading(true);
    eventService.getAllEvents(filters)
      .then(res => setEvents(res.data?.events || []))
      .finally(() => setIsLoading(false));
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] selection:bg-[#F84464] selection:text-white">
      <Navbar />
      
      {/* ─── Category Quick-Bar ─── */}
      <div className="bg-white border-b border-stone-200 pt-20 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex gap-8">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilters({ ...filters, category: cat.toLowerCase() })}
                className={`text-sm font-medium transition-colors hover:text-[#F84464] relative py-4 ${
                  filters.category === cat.toLowerCase() ? 'text-[#F84464]' : 'text-stone-700'
                }`}
              >
                {cat}
                {filters.category === cat.toLowerCase() && (
                  <motion.div layoutId="activeCat" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F84464]" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>List Your Show</span>
            <span>Corporates</span>
            <span>Offers</span>
            <span>Gift Cards</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-bold text-stone-900">
            {filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} in Your City` : 'Recommended Events'}
          </h2>
          <div className="flex items-center gap-2 text-[#F84464] font-semibold text-sm cursor-pointer group">
            See All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ─── Sidebar Filters (BMS Style) ─── */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Filter size={18} /> Filters
            </h3>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-stone-200">
              <p className="font-bold text-sm text-[#F84464] mb-3">Languages</p>
              <div className="flex flex-wrap gap-2">
                {['English', 'Hindi', 'Malayalam', 'Tamil'].map(l => (
                  <span key={l} className="px-3 py-1 border border-stone-200 rounded text-xs text-stone-600 hover:border-[#F84464] cursor-pointer">
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-stone-200">
              <p className="font-bold text-sm text-[#F84464] mb-3">Format</p>
              <div className="flex flex-wrap gap-2">
                {['2D', '3D', 'IMAX 2D', '4DX'].map(f => (
                  <span key={f} className="px-3 py-1 border border-stone-200 rounded text-xs text-stone-600 hover:border-[#F84464] cursor-pointer">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* ─── Event Grid ─── */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[2/3] bg-stone-200 rounded-xl" />
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-4 bg-stone-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {events.map((event) => (
                  <motion.div 
                    key={event._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group cursor-pointer"
                  >
                    <Link to={`/events/${event._id}`}>
                      {/* Poster Image */}
                      <div className="aspect-[2/3] rounded-xl overflow-hidden relative mb-4 shadow-sm">
                        <img 
                          src={event.posterUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Rating Overlay (BMS Style) */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-3 py-2 flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-[#F84464]" fill="#F84464" />
                            <span className="text-white text-xs font-bold">9.0/10</span>
                          </div>
                          <span className="text-white/60 text-[10px]">12.4k Votes</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-stone-900 leading-tight group-hover:text-stone-600 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-stone-500 truncate">
                          {event.category} • {event.city}
                        </p>
                        <p className="text-sm font-semibold text-stone-700 mt-2">
                          ₹{event.basePrice} onwards
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventListings;