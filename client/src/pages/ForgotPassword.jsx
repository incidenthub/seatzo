import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import authService from '../services/auth.service';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setSuccess('If that email is registered, an OTP has been sent.');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(email, otp, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side */}
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
            RESET <br /> ACCESS.
          </motion.h2>
          <p className="text-stone-500 text-xl font-medium tracking-tight">
            Recover your account securely <br /> with OTP verification.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-16">
            <Link to="/" className="text-2xl font-black tracking-tighter">
              SEATZO.
            </Link>
            <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-4 transition-all">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-5xl font-bold tracking-tight mb-4">
              {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="text-stone-500 font-medium">
              {step === 'email'
                ? 'Enter your email to receive a password reset OTP.'
                : `Enter the OTP sent to ${email} and your new password.`}
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

          {step === 'email' ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 group-focus-within:text-black transition-colors">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium placeholder:text-stone-200"
                  placeholder="name@example.com"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:gap-6 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Reset OTP'}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
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
                  className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-2xl font-black tracking-[0.3em] placeholder:text-stone-200"
                  placeholder="000000"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 group-focus-within:text-black transition-colors">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium placeholder:text-stone-200"
                  placeholder="Min 8 characters"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2 group-focus-within:text-black transition-colors">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pb-4 bg-transparent border-b border-stone-200 outline-none focus:border-black transition-all text-lg font-medium placeholder:text-stone-200"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:gap-6 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
