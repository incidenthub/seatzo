import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const About = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const timeline = [
    { year: '2020', title: 'The Genesis', desc: 'Started as a small team of three in a garage, driven by a passion for clean code and beautiful design.' },
    { year: '2022', title: 'Global Reach', desc: 'Expanded our operations to three continents, partnering with Fortune 500 companies and innovative startups.' },
    { year: '2024', title: 'Design Innovation', desc: 'Launched our proprietary design framework, setting new standards for digital accessibility and performance.' },
    { year: '2026', title: 'Award Winning', desc: 'Recognized by Awwwards and CSS Design Awards as the most influential design studio of the year.' },
  ];

  const team = [
    { name: 'Alex Rivers', role: 'Creative Director', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400' },
    { name: 'Sarah Chen', role: 'Head of Product', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400' },
    { name: 'Marcus Bell', role: 'Lead Developer', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
    { name: 'Elena Frost', role: 'UX Research', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Hero Header */}
      <section className="pt-40 pb-20 bg-slate-50 overflow-hidden">
        <div className="section-container">
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-9xl mb-12"
          >
            We are <span className="text-primary-600">Designers</span> & <span className="text-slate-400 italic">Builders</span>.
          </motion.h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-2xl text-slate-600 leading-relaxed"
            >
              We believe that every digital touchpoint is an opportunity to create a lasting connection. Our approach is human-centric, data-driven, and artistically inspired.
            </motion.p>
            <div className="flex flex-col gap-8">
              <div className="flex gap-12">
                <div>
                  <p className="text-4xl font-bold text-slate-900">150+</p>
                  <p className="text-slate-500">Projects Completed</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-slate-900">24</p>
                  <p className="text-slate-500">Design Awards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Image Section */}
      <section className="h-[60vh] overflow-hidden relative">
        <motion.img 
          style={{ scale, y }}
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000" 
          alt="Our Studio"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/20" />
      </section>

      {/* Timeline Section */}
      <section className="py-32 section-container">
        <h2 className="text-4xl md:text-5xl mb-20 text-center">Our Journey</h2>
        <div className="relative border-l-2 border-slate-100 ml-4 md:ml-0 md:left-1/2 md:-translate-x-1/2">
          {timeline.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`mb-20 relative md:w-1/2 ${idx % 2 === 0 ? 'md:pr-16 md:text-right md:ml-0' : 'md:pl-16 md:ml-auto'}`}
            >
              <div className={`absolute top-0 w-6 h-6 bg-primary-600 rounded-full border-4 border-white shadow-md ${idx % 2 === 0 ? '-left-3.5 md:-right-3 md:left-auto' : '-left-3.5 md:-left-3'}`} />
              <span className="text-primary-600 font-bold text-xl mb-2 block">{item.year}</span>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 bg-slate-50">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl mb-4">Meet the Visionaries</h2>
              <p className="text-slate-500 text-lg max-w-md">The talented people who make the magic happen every single day.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-6">
                  <img 
                    src={member.img} 
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <div className="flex space-x-4">
                      <a href="#" className="text-white hover:text-primary-400">Tw</a>
                      <a href="#" className="text-white hover:text-primary-400">Li</a>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                <p className="text-slate-500">{member.role}</p>
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
