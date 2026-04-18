import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Menu, X, ArrowUpRight, User, LogOut, LayoutDashboard, Ticket } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openAuthModal } from '../../store/slices/uiSlice';
import { logoutStart } from '../../store/slices/authSlice';
import Cookies from 'js-cookie';

// 2026 Category Meta - Aligned with your specific ticket types
const CATEGORIES = [
  { id: 'concerts', label: 'Concerts', icon: '🎤', description: 'Stadium tours & indie sets' },
  { id: 'sports', label: 'Sports', icon: '⚽', description: 'Elite matches & global derbies' },
  { id: 'movies', label: 'Cinema', icon: '🎬', description: 'Premieres & arthouse screenings' },
  { id: 'standup', label: 'Standup', icon: '🎙️', description: 'World-class comedy nights' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutStart());
    setIsProfileOpen(false);
    navigate('/login');
  };

  const token = Cookies.get('accessToken');
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation Constants
  const menuTransition = { type: "spring", damping: 25, stiffness: 200 };

  return (
    <nav
      className={`fixed top-0 w-full z-100 transition-all duration-700 ease-[0.16, 1, 0.3, 1] ${
        isScrolled 
          ? 'py-4 bg-surface/80 backdrop-blur-xl border-b border-black/5' 
          : 'py-8 bg-transparent'
      }`}
    >
      <div className="max-w-400 mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* --- Left: Branding & Core Navigation --- */}
        <div className="flex items-center gap-16">
          <Link 
            to="/" 
            className="group flex items-center gap-2 text-2xl font-light tracking-tighter text-stone-950"
          >
            <span className="font-bold">SEATZO</span>
            <span className="text-[#DC3558] transition-transform duration-500 group-hover:scale-150">.</span>
          </Link>

          {/* Desktop Links - Minimal Editorial Style */}
          <div className="hidden xl:flex items-center gap-10">
            <div 
              className="relative"
              onMouseEnter={() => setIsExploreOpen(true)}
              onMouseLeave={() => setIsExploreOpen(false)}
            >
              <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 hover:text-black transition-colors">
                Explore Curation <ChevronDown size={12} className={`transition-transform duration-500 ${isExploreOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Dropdown - Gallery Style */}
              <AnimatePresence>
                {isExploreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full -left-10 w-125 pt-6"
                  >
                    <div className="bg-white rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-stone-100 p-8 grid grid-cols-2 gap-4">
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/events?category=${cat.id}`}
                          className="group/item p-4 rounded-2xl hover:bg-stone-50 transition-all border border-transparent hover:border-stone-100"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl group-hover/item:scale-110 transition-transform">{cat.icon}</span>
                            <div>
                              <p className="text-[12px] font-bold uppercase tracking-widest text-stone-900">{cat.label}</p>
                              <p className="text-[10px] text-stone-400 mt-1 font-medium leading-tight">{cat.description}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Link to="/events" className="col-span-2 mt-2 p-4 border-t border-stone-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#DC3558]">
                        View Full Calendar <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/about" className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 hover:text-black transition-colors">History</Link>
            <Link to="/contact" className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 hover:text-black transition-colors">Concierge</Link>
          </div>
        </div>

        {/* --- Right: Search & Identity --- */}
        <div className="flex items-center gap-8">
          
          {/* Refined Expanding Search */}
          <div className={`hidden md:flex items-center bg-stone-100/50 rounded-full border border-transparent transition-all duration-500 px-4 ${searchFocused ? 'w-87.5 bg-white border-stone-200 shadow-sm' : 'w-50'}`}>
            <Search size={16} className="text-stone-400" />
            <input 
              type="text" 
              placeholder="Search Moments..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-transparent px-3 py-2.5 text-xs outline-none placeholder:text-stone-300 font-medium"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 group"
            >
              {token ? (
                <>
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-none text-stone-900">{user?.name}</p>
                    <p className="text-[8px] font-medium text-stone-400 tracking-tighter mt-1">Access Key ID: 2026-X</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-stone-950 flex items-center justify-center text-white text-xs font-bold ring-0 ring-stone-200 group-hover:ring-4 transition-all duration-500">
                    {user?.name?.[0]}
                  </div>
                </>
              ) : (
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 ring-0 ring-stone-200 group-hover:ring-4 group-hover:bg-stone-200 transition-all duration-500">
                  <User size={20} />
                </div>
              )}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-6 w-64 bg-white rounded-3xl shadow-2xl border border-stone-100 p-3 overflow-hidden"
                >
                  {token ? (
                    <>
                      <div className="p-4 mb-2 bg-stone-50 rounded-2xl">
                         <p className="text-[10px] font-black uppercase text-stone-300 tracking-widest mb-1">Status</p>
                         <p className="text-xs font-bold text-[#DC3558] flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#DC3558] animate-pulse" />
                           Vibrance Member
                         </p>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-stone-600 hover:text-black hover:bg-stone-50 rounded-xl transition-all"
                      >
                        <User size={16} /> Identity
                      </Link>
                      
                      {/* Priority Action: List Event */}
                      <Link 
                        to="/organizer-register" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-[#DC3558] hover:bg-[#DC3558]/5 rounded-xl transition-all"
                      >
                        <Ticket size={16} className="text-[#DC3558]/30" /> List Your Event
                      </Link>

                      {user?.role === 'organiser' && (
                        <Link 
                          to="/organizer-dashboard" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-stone-600 hover:text-black hover:bg-stone-50 rounded-xl transition-all"
                        >
                          <LayoutDashboard size={16} /> Admin Space
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <LogOut size={16} /> Terminate Session
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 mb-2 bg-stone-50 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-stone-300 tracking-widest mb-1">Guest Mode</p>
                        <p className="text-[11px] font-bold text-stone-600">Sync with the scene for full access.</p>
                      </div>
                      <Link 
                        to="/organizer-register" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-[#DC3558] hover:bg-[#DC3558]/5 rounded-xl transition-all"
                      >
                         <ArrowUpRight size={16} className="text-[#DC3558]/30" /> List Your Event
                      </Link>
                      <button 
                        onClick={() => { dispatch(openAuthModal()); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-stone-600 hover:text-black hover:bg-stone-50 rounded-xl transition-all"
                      >
                         <User size={16} className="text-stone-300" /> Sign In
                      </button>
                      <button 
                        onClick={() => { dispatch(openAuthModal()); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-stone-600 hover:text-black hover:bg-stone-50 rounded-xl transition-all border-t border-stone-50 mt-1 pt-4"
                      >
                         <Ticket size={16} className="text-stone-300" /> Create Account
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            className="xl:hidden p-2 text-stone-950 hover:bg-stone-100 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* --- Mobile Fullscreen Overlay --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={menuTransition}
            className="fixed inset-0 h-screen bg-white z-200 p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-xl font-bold tracking-tighter">SEATZO<span className="text-[#DC3558]">.</span></span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-stone-100 rounded-full"><X size={24}/></button>
            </div>

            <div className="space-y-8">
              {['Concerts', 'Sports', 'Cinema', 'Standup'].map((item) => (
                <Link
                  key={item}
                  to="/events"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-6xl font-light tracking-tighter hover:italic hover:text-[#DC3558] transition-all"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="mt-auto space-y-4">
               <div className="h-px bg-stone-100 w-full mb-8" />
               <Link to="/organizer-register" className="flex items-center justify-between p-8 bg-stone-950 text-white rounded-[2.5rem]">
                  <span className="text-2xl font-light">List Event</span>
                  <ArrowUpRight size={32} />
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;