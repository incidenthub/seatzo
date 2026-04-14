import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openAuthModal } from '../../store/slices/uiSlice';
import Cookies from 'js-cookie';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = Cookies.get('accessToken');
  const userString = Cookies.get('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const leftLinks = [
    { name: 'Explore', path: '/events', hasDropdown: true },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]'
          : 'bg-white'
          }`}
      >
        <div className="max-w-[1360px] mx-auto px-5 h-[56px] flex items-center justify-between gap-4">

          {/* ─── Left: Logo + Links ─────────────────────────── */}
          <div className="flex items-center gap-7">
            {/* Logo */}
            <Link to="/" className="text-[22px] font-bold text-[#1a1a1a] tracking-[-0.02em] shrink-0">
              S.
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-6">
              {leftLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-1 text-[14px] transition-colors ${location.pathname === link.path
                    ? 'text-[#1a1a1a] font-medium'
                    : 'text-[#666] hover:text-[#1a1a1a]'
                    }`}
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown size={14} className="text-[#999]" />}
                </Link>
              ))}
            </div>
          </div>

          {/* ─── Center: Search Bar ────────────────────────── */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-[320px] mx-4"
          >
            <div className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Inspiration"
                className="w-full h-[36px] pl-9 pr-4 rounded-full bg-[#f5f5f5] border-none outline-none text-[13px] text-[#1a1a1a] placeholder:text-[#999] focus:bg-[#efefef] transition-colors"
              />
            </div>
          </form>

          {/* ─── Right: Auth Buttons ──────────────────────── */}
          <div className="hidden lg:flex items-center gap-4">
            {token ? (
              <>
                {user?.role === 'organiser' && (
                  <Link
                    to="/organizer-dashboard"
                    className="text-[14px] text-[#DC3558] font-bold hover:text-[#C02A4A] transition-colors mr-4"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                onClick={() => {
                  Cookies.remove('accessToken');
                  Cookies.remove('user');
                  window.location.reload();
                }}
                className="h-[34px] px-5 rounded-md bg-[#1a1a1a] text-white text-[13px] font-medium flex items-center hover:bg-[#333] transition-colors"
              >
                Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/organizer-register"
                  className="text-[14px] text-[#DC3558] font-bold hover:text-[#C02A4A] transition-colors mr-2"
                >
                  List Your Event
                </Link>
                <button
                  onClick={() => dispatch(openAuthModal())}
                  className="text-[14px] text-[#666] hover:text-[#1a1a1a] transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => dispatch(openAuthModal())}
                  className="h-[34px] px-4 rounded-md bg-[#1a1a1a] text-white text-[13px] font-medium flex items-center hover:bg-[#333] transition-colors"
                >
                  Get Started
                </button>
                <Link
                  to="/events"
                  className="h-[34px] px-4 rounded-md border border-[#ddd] text-[#1a1a1a] text-[13px] font-medium flex items-center hover:border-[#bbb] transition-colors"
                >
                  Browse Events
                </Link>
              </>
            )}
          </div>

          {/* ─── Mobile: Hamburger ────────────────────────── */}
          <button
            className="lg:hidden p-1.5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ─── Mobile Menu ──────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-[56px] bg-white z-40 overflow-y-auto"
          >
            <div className="px-5 py-6 space-y-1">
              {/* Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Inspiration"
                    className="w-full h-[40px] pl-9 pr-4 rounded-full bg-[#f5f5f5] border-none outline-none text-[14px] text-[#1a1a1a] placeholder:text-[#999]"
                  />
                </div>
              </form>

              {leftLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-[16px] text-[#1a1a1a] font-medium border-b border-[#f0f0f0]"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-6 space-y-3">
                {token ? (
                  <>
                    {user?.role === 'organiser' && (
                      <Link
                        to="/organizer-dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full py-3 mb-2 bg-[#DC3558]/[0.08] text-[#DC3558] border border-[#DC3558]/20 text-center rounded-md text-[14px] font-bold"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      Cookies.remove('accessToken');
                      Cookies.remove('user');
                      window.location.reload();
                    }}
                    className="block w-full py-3 bg-[#1a1a1a] text-white text-center rounded-md text-[14px] font-medium"
                  >
                    Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/organizer-register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full py-3 mb-2 bg-[#DC3558]/[0.08] text-[#DC3558] border border-[#DC3558]/20 text-center rounded-md text-[14px] font-bold"
                    >
                      List Your Event
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        dispatch(openAuthModal());
                      }}
                      className="block w-full py-3 border border-[#ddd] text-center rounded-md text-[14px] font-medium text-[#1a1a1a]"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        dispatch(openAuthModal());
                      }}
                      className="block w-full py-3 bg-[#1a1a1a] text-white text-center rounded-md text-[14px] font-medium"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
