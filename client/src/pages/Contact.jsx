import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail, Globe } from 'lucide-react';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.message) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="bg-white">
      <Navbar />
      
      <section className="pt-40 pb-32 bg-slate-50">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 text-slate-900 leading-tight">
                Let's Start a <span className="text-primary-600 underline decoration-primary-200 decoration-8 underline-offset-8">Project</span> Together.
              </h1>
              <p className="text-xl text-slate-500 mb-12 max-w-lg">
                Have an idea that needs a creative touch? We're ready to help you build something extraordinary.
              </p>

              <div className="space-y-8">
                {[
                  { icon: <Mail className="text-primary-600" />, label: 'Email Us', val: 'hello@designstudio.com' },
                  { icon: <Phone className="text-primary-600" />, label: 'Call Us', val: '+1 (555) 000-1234' },
                  { icon: <MapPin className="text-primary-600" />, label: 'Visit Us', val: '123 Creative Blvd, New York, NY 10001' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 group">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-lg font-semibold text-slate-900">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock Map Visualization */}
              <div className="mt-16 relative rounded-3xl overflow-hidden h-64 bg-slate-200 border-4 border-white shadow-xl">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-74.006,40.7128,12,0/600x400?access_token=pk.eyJ1IjoicmFzaGlpIiwiYSI6ImNreHd6...') bg-cover bg-center opacity-80" />
                <div className="absolute inset-0 bg-primary-600/10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-primary-600/20 rounded-full animate-ping" />
                    <div className="relative w-8 h-8 bg-primary-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
                      <MapPin size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border border-slate-50"
            >
              {isSubmitted ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Send size={40} />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Message Sent!</h3>
                  <p className="text-slate-500 mb-8">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button onClick={() => setIsSubmitted(false)} className="btn-secondary">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-6 py-4 bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-100'} rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all`}
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="mt-2 text-sm text-red-500 font-medium">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-6 py-4 bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-100'} rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="mt-2 text-sm text-red-500 font-medium">{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all"
                      placeholder="Project Inquiry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                    <textarea 
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 bg-slate-50 border ${errors.message ? 'border-red-500' : 'border-slate-100'} rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all resize-none`}
                      placeholder="Tell us about your project..."
                    ></textarea>
                    {errors.message && <p className="mt-2 text-sm text-red-500 font-medium">{errors.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full btn-primary py-5 flex items-center justify-center gap-3 disabled:opacity-70 group"
                  >
                    {isSubmitting ? (
                      <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Message <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Internal component for reuse
const ArrowRight = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default Contact;
