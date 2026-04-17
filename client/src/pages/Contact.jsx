import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Phone, Mail, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Identification required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid digital address required';
    if (!formData.message) newErrors.message = 'Inquiry details required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-stone-950 selection:bg-[#DC3558] selection:text-white min-h-screen">
      <Navbar />
      
      <main className="pt-40 pb-32 max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          
          {/* --- Left: Editorial Info --- */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-[10vw] lg:text-[6vw] leading-[0.85] font-light tracking-tighter mb-12">
                TALK TO THE <br />
                <span className="italic font-serif">CONCIERGE</span>
                <span className="text-[#DC3558]">.</span>
              </h1>
              
              <p className="text-xl text-stone-500 font-medium mb-16 max-w-md leading-snug">
                Whether you're an organizer seeking a stage or a fan seeking the front row, our team is standing by to bridge the gap.
              </p>

              <div className="space-y-10">
                {[
                  { icon: <Mail size={18} />, label: 'Digital', val: 'concierge@seatzo.com' },
                  { icon: <Phone size={18} />, label: 'Direct', val: '+1 (212) 555-0199' },
                  { icon: <MapPin size={18} />, label: 'Studio', val: '401 Broadway, New York, NY' },
                ].map((item, idx) => (
                  <div key={idx} className="group flex items-start gap-6">
                    <div className="mt-1 p-3 rounded-full bg-stone-100 text-stone-400 group-hover:bg-[#DC3558] group-hover:text-white transition-all duration-500">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">{item.label}</p>
                      <p className="text-lg font-bold tracking-tight">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Dynamic Map Visualization (2026 Style) */}
            <div className="mt-20 relative h-48 rounded-[2rem] overflow-hidden grayscale contrast-125 border border-stone-200 shadow-inner hidden lg:block">
               <div className="absolute inset-0 bg-stone-200/50 animate-pulse" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400">Map Data Syncing...</div>
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#DC3558] rounded-full">
                  <div className="absolute inset-0 bg-[#DC3558] rounded-full animate-ping opacity-50" />
               </div>
            </div>
          </div>

          {/* --- Right: Minimalist Form --- */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="bg-white p-8 md:p-16 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.03)] border border-stone-100"
            >
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24"
                  >
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-10">
                      <CheckCircle2 size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-4xl font-light tracking-tighter mb-6">Inquiry Received</h3>
                    <p className="text-stone-500 font-medium mb-10">Our concierge team will respond within 4 hours.</p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="px-10 py-4 bg-stone-950 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#DC3558] transition-all"
                    >
                      New Submission
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="relative border-b border-stone-100 focus-within:border-stone-950 transition-colors">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Identification</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full py-4 bg-transparent outline-none font-bold placeholder:text-stone-200"
                          placeholder="Your Name"
                        />
                        {errors.name && <p className="absolute -bottom-6 text-[9px] text-red-500 font-bold uppercase">{errors.name}</p>}
                      </div>

                      <div className="relative border-b border-stone-100 focus-within:border-stone-950 transition-colors">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Digital Address</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full py-4 bg-transparent outline-none font-bold placeholder:text-stone-200"
                          placeholder="Email@domain.com"
                        />
                        {errors.email && <p className="absolute -bottom-6 text-[9px] text-red-500 font-bold uppercase">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="border-b border-stone-100">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Nature of Inquiry</label>
                      <select 
                        className="w-full py-4 bg-transparent outline-none font-bold appearance-none cursor-pointer"
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      >
                        <option>General Inquiry</option>
                        <option>Organizer Partnerships</option>
                        <option>VIP Backstage Access</option>
                        <option>Technical Support</option>
                      </select>
                    </div>

                    <div className="relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Inquiry Details</label>
                      <textarea 
                        rows="4"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full py-4 bg-transparent border-b border-stone-100 focus:border-stone-950 outline-none font-bold resize-none placeholder:text-stone-200 transition-colors"
                        placeholder="What are we looking for?"
                      />
                      {errors.message && <p className="absolute -bottom-6 text-[9px] text-red-500 font-bold uppercase">{errors.message}</p>}
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="group w-full py-6 bg-stone-950 text-white rounded-[2rem] flex items-center justify-center gap-4 hover:bg-[#DC3558] transition-all duration-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="text-xs font-bold uppercase tracking-[0.3em]">Initialize Transmission</span>
                          <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;