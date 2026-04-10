import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap, Target, Shield, ArrowUpRight, Globe, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const Home = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const features = [
    {
      icon: <Zap size={24} />,
      title: 'Real-Time Sync',
      description: 'Atomic operations ensure zero double-bookings with millisecond precision.'
    },
    {
      icon: <Target size={24} />,
      title: 'Smart Pricing',
      description: 'Algorithms that adjust to demand patterns and time sensitivity.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Ironclad Security',
      description: 'Enterprise-grade encryption and secure webhook verification.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 mb-6 rounded-full border border-black/10 text-xs font-medium uppercase tracking-widest bg-stone-50">
              Introducing Seatzo V1.0
            </motion.div>
            
            <motion.h1 
              variants={itemVariants} 
              className="text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.9] font-black tracking-tight mb-8"
            >
              FUTURE OF <br />
              <span className="text-secondary-foreground/20">TICKETING</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants} 
              className="text-xl md:text-2xl text-stone-500 max-w-xl mb-12 leading-relaxed"
            >
              A production-ready platform for seamless event management, atomic seat locking, and dynamic scalability.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Link 
                to="/events" 
                className="group relative px-8 py-4 bg-black text-white rounded-full flex items-center gap-3 overflow-hidden transition-all hover:pr-12"
              >
                <span className="relative z-10 font-bold">Discover Events</span>
                <ArrowRight size={20} className="relative z-10 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-accent translate-y-full transition-transform group-hover:translate-y-0" />
              </Link>
              
              <Link 
                to="/register" 
                className="px-8 py-4 border border-black/10 rounded-full font-bold hover:bg-stone-50 transition-colors"
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute right-[-5%] top-[20%] w-[40%] aspect-square border border-black/5 rounded-full pointer-events-none"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute right-[10%] top-[40%] w-[15%] aspect-square bg-accent/5 rounded-3xl blur-3xl pointer-events-none"
        />
      </section>

      {/* Marquee */}
      <div className="py-20 border-y border-black/5 overflow-hidden whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 items-center h-full"
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-8xl font-black text-stone-100 uppercase tracking-tighter">
              Awwwards Selection • Seatzo 2024 • Scalable Architecture • Minimal Design • 
            </span>
          ))}
        </motion.div>
      </div>

      {/* Philosophy Section */}
      <section className="py-32 px-6">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">Our Philosophy</span>
            <h2 className="text-5xl font-bold mb-8 leading-tight">
              Crafting experiences that vanish into the background.
            </h2>
            <p className="text-stone-500 text-lg leading-relaxed mb-10">
              We believe ticketing shouldn't be a hurdle. Seatzo uses edge-optimized locking mechanisms and a refined UI to make sure the focus remains on the event itself.
            </p>
            
            <div className="space-y-8">
              {features.map((f, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center border border-black/5 group-hover:bg-black group-hover:text-white transition-colors">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">{f.title}</h3>
                    <p className="text-stone-500">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative aspect-square bg-stone-100 rounded-[4rem] overflow-hidden group">
            <motion.div 
               whileHover={{ scale: 1.05 }}
               transition={{ duration: 0.6 }}
               className="w-full h-full bg-stone-200"
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="p-10 glass rounded-3xl text-center max-w-[200px]">
                  <Layers className="mx-auto mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Multi-Layer Reliability</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Impact */}
      <section className="bg-black text-white py-32 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            {[
              { label: 'Latency', value: '12ms' },
              { label: 'Uptime', value: '99.99%' },
              { label: 'Security', value: 'AES-256' },
              { label: 'Throughput', value: '4k/s' }
            ].map((stat, i) => (
              <div key={i} className="border-l border-white/10 pl-8">
                <span className="text-white/40 text-sm uppercase tracking-widest mb-2 block">{stat.label}</span>
                <span className="text-5xl font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-6 text-center">
         <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8 }}
         >
           <h2 className="text-7xl font-bold mb-10 tracking-tight">The platform you've <br />been waiting for.</h2>
           <Link 
              to="/events" 
              className="inline-flex items-center gap-4 text-2xl font-bold hover:gap-6 transition-all group"
           >
              Create your first event <ArrowUpRight size={32} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
           </Link>
         </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
