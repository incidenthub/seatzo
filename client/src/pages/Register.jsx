import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { registerStart, clearError } from '../store/slices/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user, token } = useSelector((state) => state.auth);

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (token) navigate('/dashboard');
    return () => { dispatch(clearError()); };
  }, [token, navigate, dispatch]);

  // Watch for registerSuccess — isLoading went false, no error, and we're not logged in
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
    <div className="flex min-h-screen bg-white">
      {/* Left side - Visual (Stays same for brand consistency) */}
      <div className="hidden lg:flex w-1/2 bg-black relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-500 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 text-center px-20">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-7xl font-black text-white tracking-widest leading-none mb-6 italic"
          >
            START <br /> YOUR JOURNEY.
          </motion.h2>
          <p className="text-stone-500 text-xl font-medium tracking-tight">
            Create an account to browse, book, and manage <br /> tickets with unmatched speed.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="flex justify-between items-center mb-16">
            <Link to="/" className="text-2xl font-black tracking-tighter">
              SEATZO.
            </Link>
            <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-4 transition-all">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-5xl font-bold tracking-tight mb-4">Create Account</h1>
            <p className="text-stone-500 font-medium">Join the next generation of event access.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 uppercase tracking-widest">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-6 gap-y-8">
            <div className="col-span-2 group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 group-focus-within:text-black transition-colors">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                autoFocus
                value={formData.name}
                onChange={handleChange}
                className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium placeholder:text-stone-200"
                placeholder="John Doe"
              />
            </div>

            <div className="col-span-2 group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 group-focus-within:text-black transition-colors">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium placeholder:text-stone-200"
                placeholder="name@example.com"
              />
            </div>

            <div className="col-span-2 group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 group-focus-within:text-black transition-colors">
                I am a
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium"
              >
                <option value="customer">Customer</option>
                <option value="organiser">Organiser</option>
              </select>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 group-focus-within:text-black transition-colors">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium placeholder:text-stone-100"
                placeholder="••••••••"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 group-focus-within:text-black transition-colors">
                Confirm
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium placeholder:text-stone-100"
                placeholder="••••••••"
              />
            </div>

            <div className="col-span-2 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:gap-6 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Processing' : 'Create Account'}
                {!isLoading && <ArrowRight size={18} className="translate-y-[1px]" />}
              </button>
            </div>
          </form>

          <footer className="mt-12 text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-relaxed">
            By creating an account, you agree to our <a href="#" className="text-black">Terms of Service</a> and <a href="#" className="text-black">Privacy Policy</a>.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Register;
