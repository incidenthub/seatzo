import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, LogIn, Mail, Shield, UserPlus, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { closeAuthModal, openAuthModal } from '../../store/slices/uiSlice';
import { clearError, loginStart, registerStart } from '../../store/slices/authSlice';

const AuthModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthModalOpen, authMode } = useSelector((state) => state.ui);
  const { isLoading, error, token, user } = useSelector((state) => state.auth);
  const isRegisterMode = authMode === 'register';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (token && user && isAuthModalOpen) {
      dispatch(closeAuthModal());
      setFormError(null);

      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'organiser') {
        navigate('/organizer-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [dispatch, isAuthModalOpen, navigate, token, user]);

  useEffect(() => {
    if (!isLoading && !error && pendingRegistration) {
      const { email, role } = pendingRegistration;
      setPendingRegistration(null);
      setFormError(null);
      dispatch(closeAuthModal());
      navigate(`/verify-email?email=${encodeURIComponent(email)}&role=${role}`);
    }
  }, [dispatch, error, isLoading, navigate, pendingRegistration]);

  useEffect(() => {
    dispatch(clearError());
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError(null);
  }, [authMode, dispatch]);

  if (!isAuthModalOpen) {
    return null;
  }

  const handleClose = () => {
    setPendingRegistration(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError(null);
    dispatch(clearError());
    dispatch(closeAuthModal());
  };

  const switchMode = (mode) => {
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPendingRegistration(null);
    setFormError(null);
    dispatch(clearError());
    dispatch(openAuthModal({ mode, role: 'customer' }));
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    dispatch(clearError());
    dispatch(loginStart({
      email: String(formData.get('email') || '').trim().toLowerCase(),
      password: String(formData.get('password') || ''),
    }));
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextName = String(formData.get('name') || '').trim();
    const nextEmail = String(formData.get('email') || '').trim().toLowerCase();
    const nextPassword = String(formData.get('password') || '');
    const nextConfirmPassword = String(formData.get('confirmPassword') || '');
    const nextRole = 'customer';

    if (!nextName || !nextEmail || !nextPassword) {
      setFormError('Please complete all fields.');
      return;
    }

    if (nextPassword !== nextConfirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setFormError(null);
    dispatch(clearError());
    setPendingRegistration({ email: nextEmail, role: nextRole });
    dispatch(registerStart({
      name: nextName,
      email: nextEmail,
      password: nextPassword,
      role: nextRole,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-4xl bg-white shadow-2xl lg:grid lg:grid-cols-[0.95fr_1.05fr]"
      >
          <div className={`hidden flex-col justify-between bg-text-main p-10 text-white ${isRegisterMode ? '' : 'lg:flex'}`}>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-white/70">
                <Shield size={12} /> Secure Access
              </div>
              <h2 className="mt-8 text-5xl font-black tracking-tight">
                {authMode === 'login' ? 'Welcome back.' : 'Create your account.'}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
                {authMode === 'login'
                  ? 'Sign in to manage bookings, dashboards, and event access from one place.'
                  : 'Create a customer account for bookings. Organizers use the dedicated sign-in and registration pages.'}
              </p>
            </div>

            <div className="space-y-3 text-sm text-white/75">
              <p>Fast sign-in and account creation across the app.</p>
              <p>Customer and admin access stay in this shared popup.</p>
            </div>
          </div>

          <div className={`relative ${isRegisterMode ? 'lg:col-span-2 p-4 sm:p-5 lg:px-8 lg:py-6' : 'p-6 sm:p-8 lg:p-10'}`}>
            <div className={isRegisterMode ? 'mx-auto max-w-2xl' : ''}>
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full border border-stone-200 p-2 text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-950"
            >
              <X size={18} />
            </button>

            <div className={`mb-6 flex items-center gap-3 ${isRegisterMode ? 'justify-between sm:justify-start' : ''}`}>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] transition-colors ${
                  authMode === 'login'
                    ? 'bg-stone-950 text-white'
                    : 'border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-950'
                }`}
              >
                <LogIn size={14} />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] transition-colors ${
                  authMode === 'register'
                    ? 'bg-stone-950 text-white'
                    : 'border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-950'
                }`}
              >
                <UserPlus size={14} />
                Register
              </button>
            </div>

            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#DC3558]">
                {authMode === 'login' ? 'Return to your account' : 'Create a new account'}
              </p>
              <h3 className={`mt-3 font-black tracking-tight text-stone-950 ${isRegisterMode ? 'text-2xl sm:text-3xl' : 'text-3xl'}`}>
                {authMode === 'login' ? 'Sign in' : 'Create account'}
              </h3>
              <p className={`mt-3 text-sm leading-6 text-stone-500 ${isRegisterMode ? 'max-w-xl' : ''}`}>
                {authMode === 'login'
                  ? 'Use your email and password to continue.'
                  : 'Create a customer account to start booking.'}
              </p>
            </div>

            {formError || error ? (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {formError || error}
              </div>
            ) : null}

            <form
              key={authMode}
              onSubmit={authMode === 'login' ? handleLoginSubmit : handleRegisterSubmit}
              className={isRegisterMode ? 'space-y-4' : 'space-y-5'}
            >
              {authMode === 'register' ? (
                <>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Name</span>
                    <input
                      type="text"
                      name="name"
                      required
                      autoComplete="name"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                      placeholder="John Doe"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Email</span>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="username"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                      placeholder="name@example.com"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Password</span>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-950"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Confirm password</span>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        required
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder="Repeat your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-950"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>
                </>
              ) : (
                <>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Email</span>
                    <div className="relative">
                      <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        autoComplete="username"
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder="name@example.com"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Password</span>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        autoComplete="current-password"
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-950"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading
                  ? authMode === 'login'
                    ? 'Signing in...'
                    : 'Creating account...'
                  : authMode === 'login'
                    ? 'Sign in'
                    : 'Create account'}
                {!isLoading ? <ArrowRight size={14} /> : null}
              </button>
            </form>

            <div className={`mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500 ${isRegisterMode ? 'text-xs sm:text-sm' : ''}`}>
              {authMode === 'login' ? (
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-semibold text-[#DC3558] hover:underline"
                >
                  Create an account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-[#DC3558] hover:underline"
                >
                  Sign in instead
                </button>
              )}
              {' '}
              {authMode === 'register' ? 'for fast booking.' : ''}
            </div>
            </div>
          </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;
