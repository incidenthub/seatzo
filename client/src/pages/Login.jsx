import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { loginStart, clearError } from '../store/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate('/dashboard');
    return () => { dispatch(clearError()); };
  }, [user, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginStart(formData));
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-black relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-500 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 text-center px-20">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-7xl font-black text-white tracking-widest leading-none mb-6 italic"
          >
            JOIN THE <br /> ELITE.
          </motion.h2>
          <p className="text-stone-500 text-xl font-medium tracking-tight">
            Secure your presence at the most exclusive events <br /> with Seatzo's atomic infrastructure.
          </p>
        </div>
        {/* Decorative Ticket */}
        <motion.div 
          animate={{ rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[200px] bg-white rounded-2xl opacity-5 rotate-12"
        />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-block mb-20 text-2xl font-black tracking-tighter">
            SEATZO.
          </Link>

          <div className="mb-10">
            <h1 className="text-5xl font-bold tracking-tight mb-4">Welcome back</h1>
            <p className="text-stone-500 font-medium">Enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 uppercase tracking-widest">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 group-focus-within:text-black transition-colors">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium placeholder:text-stone-200"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 group-focus-within:text-black transition-colors">
                  Password
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-black"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium placeholder:text-stone-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:gap-6 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Processing' : 'Access Dashboard'}
                {!isLoading && <ArrowRight size={18} className="translate-y-[1px]" />}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-stone-100 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
            <Link to="/forgot-password" className="text-stone-400 hover:text-black hover:italic transition-colors">Forgot Password?</Link>
          </div>
          <div className="mt-6 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
            <span className="text-stone-400">New around here?</span>
            <Link to="/register" className="text-black hover:italic">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
