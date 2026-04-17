// Hero.jsx
import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import TicketSwarmScene from '../Homepage/TicketSwarm';

const Hero = () => {
  // Animation Variants
  const containerVars = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.5 }
    }
  };

  const itemVars = {
    initial: { opacity: 0, y: 40 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center bg-[#FAF9F6] selection:bg-[#DC3558] selection:text-white px-6 overflow-hidden pt-24 pb-12">
      
      {/* ─── Part 1: The 3D Ticket Swarm (Background Layer) ─── */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 35 }}>
          <Suspense fallback={null}>
            <TicketSwarmScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Background Subtle Grain Texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-1"></div>

      {/* ─── Part 2: Centered Typographic Anchor (Foreground) ─── */}
      <motion.div 
        variants={containerVars}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto w-full text-center z-10 flex flex-col items-center gap-16"
      >
        <div className="space-y-6 flex flex-col items-center">
          <motion.div variants={itemVars} className="flex items-center gap-3">
             <span className="w-8 h-[1px] bg-[#DC3558]/30"></span>
             <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-stone-400">
               Frontier Access — 2026
             </p>
             <span className="w-8 h-[1px] bg-[#DC3558]/30"></span>
          </motion.div>
          
          <motion.h1 
            variants={itemVars}
            className="text-[11vw] lg:text-[8vw] font-light leading-[0.85] tracking-tighter text-stone-950 max-w-5xl"
          >
            Moments That <br /> 
            Defy <span className="italic font-serif">Vibrance</span><span className="text-[#DC3558]">.</span>
          </motion.h1>
          
          <motion.p variants={itemVars} className="text-sm md:text-base text-stone-400 max-w-md leading-relaxed font-medium pt-4">
             Seatzo verifies entry to the world’s leading cultural, sporting, and entertainment phenomenons.
          </motion.p>
        </div>

        {/* Integrated Minimal Search/CTA */}
        <motion.div variants={itemVars} className="w-full max-w-xl">
           <div className="group relative flex items-center bg-white border border-stone-200 rounded-2xl p-2 pl-6 shadow-sm transition-all hover:shadow-xl hover:border-stone-300">
              <Search size={18} className="text-stone-300 group-hover:text-black transition-colors" />
              <input 
                 type="text" 
                 placeholder="Search Concerts, Sports, Cinema, or Standup..." 
                 className="w-full bg-transparent px-4 py-4 text-sm outline-none placeholder:text-stone-300 font-medium"
              />
              <button className="bg-black text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#DC3558] transition-colors active:scale-95">
                 Find Access
              </button>
           </div>
           <div className="flex gap-6 mt-5 px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
               {['#Concerts', '#DerbyDay', '#Cannes', '#Apollo'].map(tag => (
                   <span key={tag} className="cursor-pointer hover:text-black transition-colors">{tag}</span>
               ))}
           </div>
        </motion.div>
      </motion.div>

      {/* ─── Minimalist Bottom Utility Bar ─── */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 1.5 }}
         className="absolute bottom-10 left-6 right-6 lg:left-12 lg:right-12 z-10 flex flex-wrap justify-between items-center gap-6 border-t border-stone-100 pt-8"
      >
      </motion.div>
    </section>
  );
};

export default Hero;