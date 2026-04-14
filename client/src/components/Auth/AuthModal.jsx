import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { closeAuthModal } from '../../store/slices/uiSlice';
import { loginStart } from '../../store/slices/authSlice';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 15.69c-.06 1.76 1.5 2.36 1.57 2.39-.02.08-.24.81-.74 1.54-.44.64-1.05 1.5-1.74 1.52-.71.02-1.02-.42-1.83-.42-.81 0-1.1.41-1.85.44-.69.02-1.22-.76-1.75-1.54-1.07-1.56-1.91-4.41-1.37-6.38.31-1.12 1.12-1.88 2.06-1.9 1.11-.02 1.83.69 2.51.69.7 0 1.53-.78 2.68-.66.49.02 2.03.18 2.92 1.48-.08.06-1.74 1.02-1.71 2.99zM15.41 6.8c.45-.55.75-1.32.66-2.1-.64.03-1.44.44-1.91.99-.41.48-.77 1.28-.67 2.05.7.06 1.46-.38 1.92-.94z"/>
  </svg>
);

const IndianFlag = () => (
  <svg width="24" height="16" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="border border-gray-200">
    <rect width="36" height="8" fill="#FF9933"/>
    <rect y="8" width="36" height="8" fill="#FFFFFF"/>
    <rect y="16" width="36" height="8" fill="#138808"/>
    <circle cx="18" cy="12" r="3.5" stroke="#000080" strokeWidth="0.5"/>
    {/* Spoke approximation */}
    <path d="M18 9 L18 15 M15 12 L21 12 M16 10 L20 14 M16 14 L20 10" stroke="#000080" strokeWidth="0.5" />
  </svg>
);



const AuthModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthModalOpen } = useSelector((state) => state.ui);
  const { isLoading, error, token, user } = useSelector((state) => state.auth);
  
  const [view, setView] = useState('options'); // 'options' | 'email'
  const [formData, setFormData] = useState({ email: '', password: '' });

  React.useEffect(() => {
    if (token && isAuthModalOpen) {
      dispatch(closeAuthModal());
      if (user?.role === 'organiser') {
        navigate('/organizer-dashboard');
      }
    }
  }, [token, user, isAuthModalOpen, dispatch, navigate]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    dispatch(closeAuthModal());
    setTimeout(() => {
      setView('options');
      setFormData({ email: '', password: '' });
    }, 300);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    dispatch(loginStart(formData));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white w-full max-w-[420px] rounded-lg shadow-2xl overflow-hidden flex flex-col"
          style={{ minHeight: '520px' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-6 border-b border-white relative">
            {view === 'email' && (
              <button onClick={() => setView('options')} className="text-gray-500 hover:text-black absolute left-6">
                &#8592; Back
              </button>
            )}
            <h2 className="text-[#333] text-[18px] font-bold tracking-tight w-full text-center">
              Get Started
            </h2>
            <button
              onClick={handleClose}
              className="absolute right-6 text-gray-400 hover:text-black transition-colors"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 px-8 py-4 flex flex-col justify-center">
            {view === 'options' ? (
              <div className="space-y-4">
                <button className="w-full flex items-center justify-center gap-6 py-3.5 bg-white border border-[#ccc] rounded-md hover:bg-gray-50 transition-colors group relative">
                  <div className="absolute left-6"><GoogleIcon /></div>
                  <span className="text-[14px] text-[#555] font-medium group-hover:text-[#333]">Continue with Google</span>
                </button>
                
                <button 
                  onClick={() => setView('email')}
                  className="w-full flex items-center justify-center gap-6 py-3.5 bg-white border border-[#ccc] rounded-md hover:bg-gray-50 transition-colors group relative"
                >
                  <div className="absolute left-6"><Mail size={20} className="text-[#555]" /></div>
                  <span className="text-[14px] text-[#555] font-medium group-hover:text-[#333]">Continue with Email</span>
                </button>

                <button className="w-full flex items-center justify-center gap-6 py-3.5 bg-white border border-[#ccc] rounded-md hover:bg-gray-50 transition-colors group relative">
                  <div className="absolute left-6"><AppleIcon /></div>
                  <span className="text-[14px] text-[#555] font-medium group-hover:text-[#333]">Continue with Apple</span>
                </button>

                <div className="text-center py-6 text-[#999] text-[13px] tracking-wide relative">
                  <span className="bg-white px-4 relative z-10">OR</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-transparent shrink-0">
                    <IndianFlag />
                    <span className="text-[#333] text-[14px] font-medium">+91</span>
                    <ChevronDown size={14} className="text-[#999]" />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Continue with mobile number" 
                    className="w-full pb-2 text-[14px] outline-none border-b border-[#ccc] focus:border-[#333] placeholder:text-[#999] text-[#333] transition-colors"
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {error && <div className="text-red-500 text-[12px] bg-red-50 p-3 rounded-md">{error}</div>}
                <div>
                  <label className="block text-[12px] text-[#666] mb-1.5 uppercase font-medium">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    className="w-full pb-2 text-[14px] outline-none border-b border-[#ccc] focus:border-[#DC3558] text-[#333] transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[#666] mb-1.5 uppercase font-medium">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                    className="w-full pb-2 text-[14px] outline-none border-b border-[#ccc] focus:border-[#DC3558] text-[#333] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-4 bg-[#DC3558] text-white rounded-md font-bold text-[14px] hover:bg-[#C02A4A] transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Continue'}
                </button>
              </form>
            )}
          </div>

          {/* Footer terms */}
          <div className="py-6 px-8 text-center mt-auto">
            <p className="text-[12px] text-[#666]">
              I agree to{' '}
              <a href="#" className="underline text-[#0078ff] hover:text-[#005bb5]">Terms & Conditions</a>
              {' '}and{' '}
              <a href="#" className="underline text-[#0078ff] hover:text-[#005bb5]">Privacy Policy</a>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
