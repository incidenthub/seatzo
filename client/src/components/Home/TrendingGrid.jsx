import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const featuredEvents = [
    {
        id: 'discover-movies',
        title: 'Blockbuster Nights',
        location: 'Mumbai, IN',
        date: '19/04',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
        size: 'large',
    },
    {
        id: 'discover-live',
        title: 'Live Music',
        location: 'Bengaluru, IN',
        date: '21/04',
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=800',
        size: 'small',
    },
    {
        id: 'discover-comedy',
        title: 'Standup Specials',
        location: 'Delhi, IN',
        date: '22/04',
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=800',
        size: 'medium',
    },
    {
        id: 'discover-sports',
        title: 'Arena Sports',
        location: 'Chennai, IN',
        date: '24/04',
        image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=800',
        size: 'small',
    },
];

const TrendingGrid = () => {
    return (
        <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto bg-[#F9F9F9]">
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
                {featuredEvents.map((item, index) => (
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
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
