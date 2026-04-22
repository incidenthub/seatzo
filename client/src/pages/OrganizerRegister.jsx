import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import authService from '../services/auth.service';
import { clearError, registerFailure, registerStart, registerSuccess } from '../store/slices/authSlice';

const OrganizerRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user, isLoading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    if (user.role === 'organiser') {
      navigate('/organizer-dashboard', { replace: true });
    } else if (user.role === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [dispatch, navigate, token, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    dispatch(clearError());

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      setFormError('Please complete all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    dispatch(registerStart());

    try {
      await authService.register(normalizedName, normalizedEmail, password, 'organiser');
      dispatch(registerSuccess());
      navigate(`/verify-email?email=${encodeURIComponent(normalizedEmail)}&role=organiser`, { replace: true });
    } catch (err) {
      dispatch(registerFailure(err.response?.data?.error || err.response?.data?.message || 'Registration failed'));
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden lg:flex w-1/2 bg-black relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-stone-500 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 text-center px-20">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 text-7xl font-black leading-none tracking-widest text-white italic"
          >
            LIST <br /> YOUR EVENT.
          </motion.h2>
          <p className="text-xl font-medium tracking-tight text-stone-500">
            Create an organiser account to start publishing events and managing sales.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-8 md:p-20 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-16 flex items-center justify-between">
            <Link to="/" className="text-2xl font-black tracking-tighter">
              SEATZO.
            </Link>
            <Link
              to="/organizer-login"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:gap-4"
            >
              Already have an account? <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mb-10">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#DC3558]">
              Organiser registration
            </p>
            <h1 className="mb-4 text-5xl font-bold tracking-tight">Create account</h1>
            <p className="font-medium text-stone-500">
              Set up your organiser profile and verify your email to continue.
            </p>
          </div>

          {formError || error ? (
            <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold uppercase tracking-widest text-red-600">
              {formError || error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 transition-colors group-focus-within:text-black">
                Full Name
              </label>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full border-b border-stone-200 bg-transparent pb-4 text-lg font-medium outline-none transition-all placeholder:text-stone-200 focus:border-black"
                placeholder="Your name"
              />
            </div>

            <div className="group">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 transition-colors group-focus-within:text-black">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border-b border-stone-200 bg-transparent pb-4 text-lg font-medium outline-none transition-all placeholder:text-stone-200 focus:border-black"
                placeholder="organiser@example.com"
              />
            </div>

            <div className="group">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 transition-colors group-focus-within:text-black">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full border-b border-stone-200 bg-transparent pb-4 pr-12 text-lg font-medium outline-none transition-all placeholder:text-stone-200 focus:border-black"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-0 top-0 text-stone-400 transition-colors hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="group">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 transition-colors group-focus-within:text-black">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full border-b border-stone-200 bg-transparent pb-4 pr-12 text-lg font-medium outline-none transition-all placeholder:text-stone-200 focus:border-black"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-0 top-0 text-stone-400 transition-colors hover:text-black"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-4 rounded-full bg-black py-5 text-xs font-black uppercase tracking-widest text-white transition-all hover:gap-6 disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>

          <div className="mt-12 flex items-center justify-between border-t border-stone-100 pt-8 text-xs font-bold uppercase tracking-widest">
            <span className="text-stone-400">Need a quick login?</span>
            <Link to="/organizer-login" className="flex items-center gap-2 text-black hover:italic">
              <UserCheck size={14} /> Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerRegister;
