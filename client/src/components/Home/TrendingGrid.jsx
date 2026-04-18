import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import eventService from '../../services/event.service';

const TrendingGrid = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await eventService.getAllEvents({ limit: 4 });
                const fetchedEvents = res.data?.events || res.data?.data || [];
                
                // Map API data to our grid structure
                const mappedEvents = fetchedEvents.map((event, index) => ({
                    id: event._id,
                    title: event.title,
                    location: `${event.city}, IN`,
                    date: new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
                    image: event.posterUrl || "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?auto=format&fit=crop&q=80&w=800",
                    size: index === 0 ? 'large' : index === 2 ? 'medium' : 'small'
                }));
                
                setEvents(mappedEvents);
            } catch (err) {
                console.error("Failed to fetch trending events:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (isLoading && events.length === 0) {
        return (
            <div className="py-32 text-center text-stone-400 font-bold uppercase tracking-widest animate-pulse">
                Syncing Live Signals...
            </div>
        );
    }

    return (
        <section className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto bg-[#F9F9F9]">
            {/* Section Label */}
            <div className="flex justify-between items-end mb-16 border-b border-stone-200 pb-8">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#DC3558] mb-2 block">
                        Live Signals
                    </span>
                    <h2 className="text-4xl font-light italic tracking-tighter uppercase">Trending<span className="text-stone-300">_</span>Now</h2>
                </div>
                <Link to="/events" className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group">
                    View Archive <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
            </div>

            {/* Asymmetric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[100px]">
                {events.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className={`group relative overflow-hidden rounded-3xl bg-white cursor-pointer ${
                            item.size === 'large' ? 'md:col-span-7 md:row-span-6' : 
                            item.size === 'medium' ? 'md:col-span-5 md:row-span-4' : 
                            'md:col-span-5 md:row-span-2'
                        }`}
                    >
                        <Link to={`/events/${item.id}`}>
                            {/* Image Layer */}
                            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 h-full w-full">
                                <img 
                                    src={item.image} 
                                    alt={item.title}
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            {/* Text Overlay */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-4 group-hover:translate-y-0">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-bold text-white uppercase tracking-widest border border-white/30">
                                        {item.date}
                                    </span>
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </div>

                                <div className="translate-y-4 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#DC3558] mb-1">
                                        {item.location}
                                    </p>
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default TrendingGrid;