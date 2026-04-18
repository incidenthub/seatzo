import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import TicketSwarmScene from '../Homepage/TicketSwarm';

const Hero = () => {
  // Animation Variants
  const containerVars = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVars = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center bg-[#F5F5F5] selection:bg-[#F84464] selection:text-white px-6 overflow-hidden pt-20 pb-12">
      
      {/* ─── 3D Ticket Swarm (Background Layer) ─── */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 35 }}>
          <Suspense fallback={null}>
            <TicketSwarmScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Subtle Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-1"></div>

      {/* ─── Main Content (Foreground) ─── */}
      <motion.div 
        variants={containerVars}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto w-full text-center z-10 flex flex-col items-center gap-10"
      >
        <div className="space-y-4 flex flex-col items-center">
          <motion.div variants={itemVars} className="flex items-center gap-2">
             <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-stone-500">
               It All Starts Here
             </p>
          </motion.div>
          
          <motion.h1 
            variants={itemVars}
            className="text-[10vw] lg:text-[7vw] font-bold leading-[0.9] tracking-tight text-stone-900 max-w-6xl"
          >
            Movies, Music <br /> 
            & <span className="text-[#F84464]">Unforgettable</span> Stories<span className="text-[#F84464]">.</span>
          </motion.h1>
          
          <motion.p variants={itemVars} className="text-sm md:text-lg text-stone-500 max-w-xl leading-relaxed font-medium">
             From the biggest blockbusters to the most intimate live shows, BookMyShow is your pass to the best entertainment in town.
          </motion.p>
        </div>

        {/* ─── Search & Location Bar ─── */}
        <motion.div variants={itemVars} className="w-full max-w-3xl">
           <div className="group relative flex flex-col md:flex-row items-center bg-white border border-stone-200 rounded-2xl p-2 shadow-xl transition-all hover:border-stone-300">
              
              {/* Search Input */}
              <div className="flex items-center flex-1 w-full pl-4">
                <Search size={20} className="text-stone-400" />
                <input 
                    type="text" 
                    placeholder="Search for Movies, Events, Plays, Sports and Activities" 
                    className="w-full bg-transparent px-4 py-4 text-sm md:text-base outline-none placeholder:text-stone-400 font-medium"
                />
              </div>

              <div className="hidden md:block w-[1px] h-8 bg-stone-200 mx-2"></div>

              {/* Location Mock (Classic BMS style) */}
              <div className="flex items-center px-4 py-2 cursor-pointer text-stone-600 hover:text-[#F84464] transition-colors">
                <MapPin size={18} className="mr-2" />
                <span className="text-sm font-semibold whitespace-nowrap">Select City</span>
              </div>

              <button className="w-full md:w-auto bg-[#F84464] text-white px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#d63a56] transition-colors active:scale-95 shadow-lg shadow-[#F84464]/20">
                  Search
              </button>
           </div>

           {/* Quick Categories */}
           <div className="flex flex-wrap justify-center gap-5 mt-6 px-3 text-[11px] font-bold uppercase tracking-widest text-stone-400">
               {['Movies', 'Stream', 'Events', 'Plays', 'Sports', 'Activities'].map(category => (
                   <span key={category} className="cursor-pointer hover:text-[#F84464] transition-all border-b-2 border-transparent hover:border-[#F84464] pb-1">
                     {category}
                   </span>
               ))}
           </div>
        </motion.div>
      </motion.div>

      {/* ─── Bottom Decorative Bar ─── */}
      <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-6 right-6 z-10 flex justify-center border-t border-stone-200/50 pt-6"
      >
        <p className="text-[10px] text-stone-400 uppercase tracking-widest">Global Entertainment Partner — 2026</p>
      </motion.div>
    </section>
  );
};

export default Hero;