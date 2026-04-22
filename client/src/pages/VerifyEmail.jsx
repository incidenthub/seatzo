import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import authService from '../services/auth.service';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const role = searchParams.get('role') || 'customer';
  const navigate = useNavigate();
  const loginRedirectPath = role === 'organiser' ? '/organizer-login' : '/login';

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setError('Email and OTP are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyEmail(email, otp);
      setSuccess(`Email verified successfully! Redirecting to ${role === 'organiser' ? 'organizer login' : 'login'}...`);
      setTimeout(() => navigate(loginRedirectPath), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      await authService.resendOTP(email);
      setSuccess('New OTP sent to your email.');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side */}
      <div className="hidden lg:flex w-1/2 bg-black relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-stone-500 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 text-center px-20">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-7xl font-black text-white tracking-widest leading-none mb-6 italic"
          >
            VERIFY <br /> YOUR IDENTITY.
          </motion.h2>
          <p className="text-stone-500 text-xl font-medium tracking-tight">
            Enter the OTP sent to your email <br /> to activate your account.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-block mb-20 text-2xl font-black tracking-tighter">
            SEATZO.
          </Link>

          <div className="mb-10">
            <h1 className="text-5xl font-bold tracking-tight mb-4">Verify Email</h1>
            <p className="text-stone-500 font-medium">
              We've sent a 6-digit OTP to <strong>{email || 'your email'}</strong>
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 uppercase tracking-widest">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-bold border border-green-100 uppercase tracking-widest">
              {success}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 group-focus-within:text-black transition-colors">
                OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-4xl font-black tracking-[0.5em] text-center placeholder:text-stone-200"
                placeholder="000000"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full group py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:gap-6 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Verifying' : 'Verify Email'}
                {!isLoading && <ArrowRight size={18} className="translate-y-px" />}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-stone-100 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
            <span className="text-stone-400">Didn't get the OTP?</span>
            <button
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-black hover:italic flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCcw size={14} /> {isResending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
