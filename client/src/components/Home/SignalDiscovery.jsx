import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const discoverySignals = [
    {
        _id: 'signal-1',
        category: 'movie',
        title: 'Opening Weekend Premieres',
        venue: 'PVR Icon, Mumbai',
        city: 'Mumbai',
        date: '2026-04-19T18:30:00.000Z',
        availableSeats: 12,
    },
    {
        _id: 'signal-2',
        category: 'concert',
        title: 'Late Night Live Sessions',
        venue: 'Phoenix Marketcity, Bengaluru',
        city: 'Bengaluru',
        date: '2026-04-21T20:00:00.000Z',
        availableSeats: 4,
    },
    {
        _id: 'signal-3',
        category: 'sports',
        title: 'City League Finals',
        venue: 'Kanteerava Stadium',
        city: 'Bengaluru',
        date: '2026-04-24T19:00:00.000Z',
        availableSeats: 0,
    },
    {
        _id: 'signal-4',
        category: 'standup',
        title: 'Weekend Comedy Circuit',
        venue: 'The Habitat, Mumbai',
        city: 'Mumbai',
        date: '2026-04-25T21:00:00.000Z',
        availableSeats: 18,
    },
    {
        _id: 'signal-5',
        category: 'theatre',
        title: 'Stage Classics Revival',
        venue: 'Prithvi Theatre',
        city: 'Mumbai',
        date: '2026-04-27T19:30:00.000Z',
        availableSeats: 8,
    },
];

const SignalDiscovery = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    
    const filters = ['All', 'movie', 'concert', 'sports', 'theatre', 'standup'];

    const events = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return discoverySignals.filter((signal) => {
            const matchesCategory = activeFilter === 'All' || signal.category === activeFilter;
            const searchableText = [signal.title, signal.venue, signal.city, signal.category].join(' ').toLowerCase();
            const matchesSearch = normalizedSearch.length === 0 || searchableText.includes(normalizedSearch);

            return matchesCategory && matchesSearch;
        });
    }, [activeFilter, searchTerm]);

    return (
        <section className="py-24 bg-white text-stone-900 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                
                {/* 1. Header & Dynamic Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-stone-100 pb-10">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-4 block">Discovery Protocol</span>
                        <h2 className="text-6xl font-light italic tracking-tighter uppercase">Signal<span className="text-[#DC3558]">_</span>Flow</h2>
                    </div>
                    
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar pb-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`relative text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${
                                    activeFilter === filter ? 'text-stone-900' : 'text-stone-300 hover:text-stone-500'
                                }`}
                            >
                                {filter}
                                {activeFilter === filter && (
                                    <motion.div 
                                        layoutId="underline"
                                        className="absolute -bottom-4 left-0 w-full h-0.5 bg-[#DC3558]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Precision Results List */}
                <div className="space-y-0 min-h-100">
                    <AnimatePresence mode="wait">
                        {events.map((sig, index) => (
                            <motion.div
                                key={sig._id}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                onClick={() => navigate('/events')}
                                className="group border-b border-stone-50 py-10 flex flex-col md:grid md:grid-cols-12 md:items-center gap-6 hover:bg-stone-50/50 transition-colors px-4 -mx-4 cursor-pointer"
                            >
                                {/* ID & Status */}
                                <div className="md:col-span-1 flex items-center gap-4">
                                    <span className="text-[10px] font-mono text-stone-300 group-hover:text-[#DC3558] transition-colors">0{index + 1}</span>
                                    <div className={`w-1 h-1 rounded-full ${sig.availableSeats === 0 ? 'bg-stone-200' : 'bg-[#DC3558] animate-pulse'}`} />
                                </div>

                                {/* Main Info */}
                                <div className="md:col-span-5">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-1">{sig.category}</span>
                                    <h3 className="text-2xl font-medium tracking-tight group-hover:italic transition-all uppercase">{sig.title}</h3>
                                </div>

                                {/* Location & Meta */}
                                <div className="md:col-span-4 text-left">
                                    <p className="text-xs font-medium text-stone-500">{sig.venue || sig.city}</p>
                                    <p className="text-[10px] text-stone-300 uppercase tracking-widest mt-1">
                                        {new Date(sig.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — Local Time
                                    </p>
                                </div>

                                {/* Call to Action */}
                                <div className="md:col-span-2 flex justify-end">
                                    <div className="w-12 h-12 border border-stone-200 rounded-full flex items-center justify-center group-hover:bg-stone-950 group-hover:text-white transition-all duration-500 group-hover:scale-110">
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {events.length === 0 && (
                            <div className="py-20 text-center text-stone-400 font-bold uppercase tracking-widest">
                                No live signals found in this frequency.
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. Global Search Input */}
                <div className="mt-20 relative">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="SEARCH BY KEYWORD, CITY, OR VIBE..."
                        className="w-full bg-transparent border-b-2 border-stone-900 py-6 text-xl md:text-3xl font-light italic tracking-tighter uppercase focus:outline-none placeholder:text-stone-100"
                    />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 p-4 bg-stone-900 text-white rounded-2xl">
                        <Search size={24} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignalDiscovery;
