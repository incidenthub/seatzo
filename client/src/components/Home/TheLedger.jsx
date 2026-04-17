import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Globe, Fingerprint } from 'lucide-react';

const TheLedger = () => {
    const feedback = [
        "Unparalleled access.",
        "The interface is the art.",
        "A new standard for curation.",
        "Seamless signal discovery.",
        "Minimal. Functional. Perfect.",
        "The vault changed everything.",
        "Authentic community vibe.",
    ];

    // Duplicate list for a seamless infinite loop
    const displayItems = [...feedback, ...feedback];

    return (
        <section className="py-24 bg-stone-950 text-white overflow-hidden border-y border-stone-800">
            {/* Header Detail */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#DC3558] rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">
                        Live Ledger / Proof of Access
                    </span>
                </div>
                <Fingerprint size={16} className="text-stone-700" />
            </div>

            {/* Infinite Scroll Ticker */}
            <div className="relative flex overflow-x-hidden">
                <motion.div 
                    className="flex whitespace-nowrap py-4"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ 
                        repeat: Infinity, 
                        ease: "linear", 
                        duration: 30 
                    }}
                >
                    {displayItems.map((text, i) => (
                        <div key={i} className="flex items-center mx-12">
                            <span className="text-5xl md:text-8xl font-light italic tracking-tighter uppercase opacity-20 hover:opacity-100 transition-opacity duration-500 cursor-default">
                                {text}
                            </span>
                            <span className="ml-12 text-[#DC3558] font-black text-2xl">•</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Global Stats: Small Metadata for Trust */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-stone-900 pt-12">
                {[
                    { label: "Active Nodes", val: "14.2k" },
                    { label: "Global Reach", val: "32 Cities" },
                    { label: "Uptime Status", val: "99.9%" },
                    { label: "Verified Tier", val: "Premium" }
                ].map((stat, idx) => (
                    <div key={idx}>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-600 mb-2">
                            {stat.label}
                        </p>
                        <p className="text-xl font-mono tracking-tighter">{stat.val}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TheLedger;