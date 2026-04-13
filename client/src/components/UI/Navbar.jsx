import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Events', path: '/events' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'py-4 bg-white/80 backdrop-blur-xl border-b border-black/5' : 'py-8 bg-transparent'}`}>
      <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
             <div className="w-4 h-4 bg-white rotate-45" />
          </div>
          <span>SEATZO.</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-bold uppercase tracking-widest transition-colors hover:text-stone-400 ${
                location.pathname === link.path ? 'text-black' : 'text-stone-500'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-6">
          {token ? (
            <Link to="/dashboard" className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-1">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold uppercase tracking-widest border-b-2 border-transparent hover:border-black transition-all pb-1">
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-40 p-10 flex flex-col justify-between"
          >
             <div className="space-y-10 pt-20">
               {navLinks.map((link) => (
                 <Link
                   key={link.name}
                   to={link.path}
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="block text-6xl font-black tracking-tighter hover:text-accent transition-colors"
                 >
                   {link.name}
                 </Link>
               ))}
             </div>
             <div>
               <Link 
                to="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-10 border-t border-black/5"
               >
                 <span className="text-2xl font-bold italic">Start Booking</span>
                 <ArrowRight size={32} />
               </Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
