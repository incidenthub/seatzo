import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { loginStart, clearError, logoutStart, loginFailure } from '../store/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && user) {
      if (user.role === 'organiser') {
        // Restricted: Organisers must use their dedicated portal
        dispatch(logoutStart());
        dispatch(loginFailure('Organiser accounts must use the dedicated Partner Login portal.'));
        navigate('/login');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
    }
    return () => { dispatch(clearError()); };
  }, [token, user, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginStart(formData));
  };

  return (
    <div className="flex min-h-screen bg-surface grain selection:bg-[#DC3558] selection:text-white overflow-hidden">
      {/* --- Left: The Atmosphere --- */}
      <div className="hidden lg:flex w-1/2 bg-[#1C1917] relative flex-col justify-between p-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1C1917]/50 to-[#1C1917]" />
        
        <div className="relative z-10 font-bold tracking-tighter text-white text-2xl">
          SEATZO<span className="text-[#DC3558]">.</span>
        </div>

        <div className="relative z-10">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-8xl font-black text-white tracking-widest leading-none mb-8 italic uppercase"
          >
            Access <br /> <span className="text-[#DC3558] not-italic">Granted.</span>
          </motion.h2>
          <p className="text-stone-400 text-lg font-medium max-w-sm tracking-tight">
            Resume your journey through the global curation of elite moments.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#DC3558] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">System Secure // 256-bit Encrypted</span>
        </div>
      </div>

      {/* --- Right: The Entry --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-24 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          <div className="flex justify-between items-center mb-16">
            <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#DC3558]">Vault Entry</h1>
            <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2">
              <ArrowLeft size={14} /> Back to Open Air
            </Link>
          </div>

          <div className="mb-12">
            <h2 className="text-5xl font-bold tracking-tight mb-4">Welcome Back</h2>
            <p className="text-stone-500 font-medium">Re-sync your identity to access the dashboard.</p>
          </div>

          {error && (
            <motion.div 
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="mb-10 p-4 bg-red-50 text-red-500 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-red-100 flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="group border-b border-stone-100 focus-within:border-[#DC3558] transition-colors">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 group-focus-within:text-[#DC3558]">
                Identity Access (Email)
              </label>
              <input
                type="email"
                name="email"
                required
                autoFocus
                value={formData.email}
                onChange={handleChange}
                className="w-full pb-4 bg-transparent outline-none text-xl font-bold tracking-tight placeholder:text-stone-200"
                placeholder="alias@domain.com"
              />
            </div>

            <div className="group border-b border-stone-100 focus-within:border-[#DC3558] transition-colors">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 group-focus-within:text-[#DC3558]">
                  Secret Key
                </label>
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[9px] font-bold uppercase tracking-widest text-stone-300 hover:text-stone-950 transition-colors"
                >
                  {showPassword ? 'Mask' : 'Reveal'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pb-4 bg-transparent outline-none text-xl font-bold tracking-tight placeholder:text-stone-200"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full py-6 bg-stone-900 text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-[#DC3558] transition-all duration-500 disabled:opacity-50 shadow-2xl shadow-black/10"
            >
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Resume Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
             <Link to="/forgot-password" size={14} className="text-stone-400 hover:text-[#DC3558] transition-colors">Recover Key</Link>
             <Link to="/register" size={14} className="text-stone-900 hover:italic">Create Identity</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
