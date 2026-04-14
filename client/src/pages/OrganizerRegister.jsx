import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { registerStart, clearError } from '../store/slices/authSlice';

const OrganizerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'organiser', // Hardcoded role for Organization Admins
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector((state) => state.auth);

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (token) navigate('/organizer-dashboard');
    return () => { dispatch(clearError()); };
  }, [token, navigate, dispatch]);

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
      {/* Left side - Visual specifically for Organizers */}
      <div className="hidden lg:flex w-1/2 bg-[#DC3558] relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-black/10 mix-blend-multiply" />
        <div className="relative z-10 text-center px-16">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6"
          >
            Sell out your <br /> next event.
          </motion.h2>
          <p className="text-white/80 text-lg font-medium">
            Join thousands of organizers using Seatzo to power their ticketing, manage attendees, and grow their events.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 overflow-y-auto">
        <div className="w-full max-w-[420px] my-auto">
          <div className="flex justify-between items-center mb-12">
            <Link to="/" className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">
              Seatzo for Organisers
            </Link>
            <Link to="/" className="text-[12px] font-medium text-[#666] flex items-center gap-1.5 hover:text-[#1a1a1a] transition-colors">
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-[32px] font-bold tracking-tight text-[#1a1a1a] mb-2">Create Org Account</h1>
            <p className="text-[#666] text-[15px]">Setup your organization and start listing events.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-[13px] border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12px] font-medium text-[#666] mb-1.5 uppercase tracking-wide">
                Organization / Admin Name
              </label>
              <input
                type="text"
                name="name"
                required
                autoFocus
                value={formData.name}
                onChange={handleChange}
                className="w-full pb-2 text-[15px] outline-none border-b border-[#ccc] focus:border-[#DC3558] text-[#1a1a1a] transition-colors"
                placeholder="Super Events Ltd."
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#666] mb-1.5 uppercase tracking-wide">
                Work Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pb-2 text-[15px] outline-none border-b border-[#ccc] focus:border-[#DC3558] text-[#1a1a1a] transition-colors"
                placeholder="admin@events.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#666] mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pb-2 text-[15px] outline-none border-b border-[#ccc] focus:border-[#DC3558] text-[#1a1a1a] transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#666] mb-1.5 uppercase tracking-wide">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pb-2 text-[15px] outline-none border-b border-[#ccc] focus:border-[#DC3558] text-[#1a1a1a] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3.5 bg-[#DC3558] text-white rounded-md font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#C02A4A] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Register Organization'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-[#666]">
            By registering, you agree to our <a href="#" className="text-[#DC3558] hover:underline">Organizer Terms</a> and <a href="#" className="text-[#DC3558] hover:underline">Fees Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizerRegister;
