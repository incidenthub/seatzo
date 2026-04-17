import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MoveLeft, Terminal, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { registerStart, clearError } from '../store/slices/authSlice';

const OrganizerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'organiser',
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token, user } = useSelector((state) => state.auth);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (token && user) {
      if (user.role === 'organiser') {
        navigate('/organizer-dashboard');
      } else {
        // Restrict access for customers and admins
        navigate('/');
      }
    }
    return () => { dispatch(clearError()); };
  }, [token, user, navigate, dispatch]);

  useEffect(() => {
    if (!isLoading && !error && registrationSuccess) {
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    }
  }, [isLoading, error, registrationSuccess, navigate, formData.email]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    dispatch(registerStart(formData));
    setRegistrationSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1C1917] selection:bg-[#DC3558] selection:text-white font-sans antialiased">
      {/* --- Minimal Navigation --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8 md:px-12 flex justify-between items-center mix-blend-difference">
        <Link to="/" className="text-xl font-bold tracking-tighter text-white">
          SEATZO<span className="text-[#DC3558]">.</span>
        </Link>
        <Link to="/" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 hover:text-white transition-colors duration-500">
          <MoveLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
        </Link>
      </nav>

      <main className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        {/* --- Hero Section --- */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="px-3 py-1 bg-stone-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                  Partner Access
                </span>
                <span className="h-[1px] w-12 bg-stone-200" />
                <span className="text-[9px] font-mono text-stone-400">TICKETFLOW_AUTH_v2.0</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8"
              >
                Onboard your <br />
                <span className="italic font-light">venue network.</span>
              </motion.h1>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden lg:block pb-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300 vertical-text rotate-180">
                SCALING LIVE SINCE 2026
              </p>
            </motion.div>
          </div>
        </section>

        {/* --- Form Section --- */}
        <div className="grid lg:grid-cols-12 gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="lg:col-span-4 space-y-12"
          >
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Terminal size={14} className="text-[#DC3558]" /> Infrastructure
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Gain access to low-latency seat locking and automated payout orchestration. 
                Your account is subject to entity verification.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield size={14} className="text-[#DC3558]" /> Security
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                All administrative channels are secured with HMAC-based signature 
                verification and end-to-end encryption.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="lg:col-span-8 bg-white p-8 md:p-16 rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] border border-stone-100"
          >
            {error && (
              <div className="mb-12 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-500">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-x-12 gap-y-12">
              <div className="group border-b border-stone-100 focus-within:border-[#DC3558] transition-all duration-500 pb-2">
                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 group-focus-within:text-[#DC3558]">
                  Venue / Admin Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-xl font-medium tracking-tight"
                  placeholder="The Grand Arena"
                />
              </div>

              <div className="group border-b border-stone-100 focus-within:border-[#DC3558] transition-all duration-500 pb-2">
                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 group-focus-within:text-[#DC3558]">
                  Official Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-xl font-medium tracking-tight"
                  placeholder="admin@venue.com"
                />
              </div>

              <div className="group border-b border-stone-100 focus-within:border-[#DC3558] transition-all duration-500 pb-2">
                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 group-focus-within:text-[#DC3558]">
                  Key Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-xl font-medium tracking-tight"
                  placeholder="••••••••"
                />
              </div>

              <div className="group border-b border-stone-100 focus-within:border-[#DC3558] transition-all duration-500 pb-2">
                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 group-focus-within:text-[#DC3558]">
                  Verify Key
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-xl font-medium tracking-tight"
                  placeholder="••••••••"
                />
              </div>

              <div className="md:col-span-2 pt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full overflow-hidden bg-stone-900 text-white rounded-2xl py-6 font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:bg-[#DC3558] disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isLoading ? "Synchronizing..." : "Initialize Venue Protocol"}
                    {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />}
                  </span>
                </button>

                <div className="mt-8 flex justify-center">
                  <Link to="/organizer-login" className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors">
                    Existing Partner? <span className="text-[#DC3558] ml-2">Secure Login</span>
                  </Link>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <footer className="px-6 md:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-stone-100 mt-20">
        <p className="text-[9px] font-bold text-stone-400 tracking-[0.2em] uppercase">
          © 2026 TicketFlow Protocol. Authorized Entry Only.
        </p>
        <div className="flex gap-8 text-[9px] font-bold text-stone-400 tracking-[0.2em] uppercase">
          <a href="#" className="hover:text-stone-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-stone-900 transition-colors">Legal</a>
          <a href="#" className="hover:text-stone-900 transition-colors">Status</a>
        </div>
      </footer>
    </div>
  );
};

export default OrganizerRegister;