import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import { ArrowUpRight, ShieldCheck, Zap, Globe } from 'lucide-react';

const About = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const stats = [
    { label: 'Moments Curated', value: '1.2M+', icon: <Zap size={16} /> },
    { label: 'Global Cities', value: '42', icon: <Globe size={16} /> },
    { label: 'Secure Access', value: '100%', icon: <ShieldCheck size={16} /> },
  ];

  const philosophy = [
    { 
      year: '2020', 
      title: 'The Disruption', 
      desc: 'Seatzo was born from a simple realization: ticketing felt like a transaction, but live events are a transformation.' 
    },
    { 
      year: '2023', 
      title: 'The Architecture', 
      desc: 'We built a proprietary engine that prioritizes the fan journey, eliminating the friction between desire and entry.' 
    },
    { 
      year: '2026', 
      title: 'The Frontier', 
      desc: 'Today, we stand as the premier gateway for the world’s most sought-after cultural moments.' 
    },
  ];

  const visionaries = [
    { name: 'Alex Rivers', role: 'Chief Curator', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600' },
    { name: 'Sarah Chen', role: 'Experience Lead', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=600' },
    { name: 'Marcus Bell', role: 'Platform Architect', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600' },
    { name: 'Elena Frost', role: 'Cultural Liaison', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <div className="bg-[#FAF9F6] text-stone-950 selection:bg-[#DC3558] selection:text-white">
      <Navbar />
      
      {/* Hero: The Statement */}
      <section className="min-h-screen pt-40 flex flex-col justify-between px-6 md:px-12 pb-20">
        <div className="max-w-[1600px] mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[14vw] md:text-[10vw] leading-[0.85] font-light tracking-tighter mb-12">
              WE ARE THE <br /> 
              <span className="italic font-serif">FRONTIER</span> OF LIVE<span className="text-[#DC3558]">.</span>
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-5">
              <p className="text-xl md:text-2xl font-medium leading-tight text-stone-600">
                Seatzo isn't just a platform; it's a cultural filter. We bridge the gap between elite organizers and the global audience that fuels the scene.
              </p>
            </div>
            <div className="lg:col-span-7 flex flex-wrap gap-12 lg:justify-end">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <span className="text-[#DC3558] flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    {stat.icon} {stat.label}
                  </span>
                  <span className="text-5xl font-light tracking-tighter">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Parallax View */}
      <section className="h-screen overflow-hidden relative mx-6 md:mx-12 rounded-[3rem]">
        <motion.img 
          style={{ scale }}
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover grayscale brightness-75"
        />
        <motion.div 
          style={{ opacity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-32 h-32 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center animate-spin-slow">
             <ArrowUpRight className="text-white transform -rotate-45" size={40} />
          </div>
        </motion.div>
      </section>

      {/* Philosophy: Vertical List */}
      <section className="py-40 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col gap-20">
          <h2 className="text-[8px] font-black uppercase tracking-[0.5em] text-[#DC3558]">Our Evolution</h2>
          {philosophy.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-stone-200 pb-20 group"
            >
              <div className="md:col-span-2">
                <span className="text-4xl font-serif italic text-stone-300 group-hover:text-[#DC3558] transition-colors duration-500">{item.year}</span>
              </div>
              <div className="md:col-span-4">
                <h3 className="text-3xl font-bold tracking-tight uppercase">{item.title}</h3>
              </div>
              <div className="md:col-span-6">
                <p className="text-lg text-stone-500 font-medium max-w-xl leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Collective (Team) */}
      <section className="py-40 bg-stone-950 text-white rounded-t-[4rem]">
        <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
          <div className="mb-24">
            <h2 className="text-6xl font-light tracking-tighter mb-4">The Collective</h2>
            <p className="text-stone-400 font-medium uppercase tracking-widest text-xs">Curating the future of access</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visionaries.map((member, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group flex flex-col"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6">
                  <img 
                    src={member.img} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <button className="px-6 py-2 border border-white rounded-full text-[10px] font-bold uppercase tracking-widest">Connect</button>
                  </div>
                </div>
                <h3 className="text-xl font-bold tracking-tight">{member.name}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-[#DC3558] mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;