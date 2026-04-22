import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Menu, X, ArrowUpRight, User, LogOut, LayoutDashboard, Ticket, Calendar, Music, Film, Mic } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openAuthModal } from '../../store/slices/uiSlice';
import { logoutStart } from '../../store/slices/authSlice';
import Cookies from 'js-cookie';

// Updated categories with modern icons
const CATEGORIES = [
  { id: 'concerts', label: 'Concerts', icon: Music, description: 'Live music & performances' },
  { id: 'sports', label: 'Sports', icon: Calendar, description: 'Games & tournaments' },
  { id: 'movies', label: 'Cinema', icon: Film, description: 'Movies & screenings' },
  { id: 'standup', label: 'Standup', icon: Mic, description: 'Comedy shows' },
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
    navigate(user?.role === 'organiser' ? '/organizer-login' : user?.role === 'admin' ? '/login' : '/');
  };

  const token = Cookies.get('accessToken');
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;
  const isStaffUser = Boolean(token && user && ['organiser', 'admin'].includes(user.role));
  const staffDashboardPath = user?.role === 'admin' ? '/admin-dashboard' : '/organizer-dashboard';
  const staffDashboardLabel = user?.role === 'admin' ? 'Admin Dashboard' : 'Organizer Dashboard';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation Constants
  const menuTransition = { type: "spring", damping: 25, stiffness: 200 };

  if (isStaffUser) {
    return (
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'py-3 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="group flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
              <span>SEATZO</span>
              <span className="text-red-600 transition-transform duration-300 group-hover:scale-110">.</span>
            </span>
            <div className="hidden h-6 w-px bg-gray-200 sm:block" />
            <div className="hidden flex-col text-[10px] font-semibold uppercase tracking-[0.35em] text-gray-400 sm:flex">
              <span>{user?.role === 'admin' ? 'Admin Access' : 'Organizer Access'}</span>
              <span>Staff portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={staffDashboardPath}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
            >
              <LayoutDashboard size={14} />
              {staffDashboardLabel}
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-red-600"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* --- Left: Branding & Core Navigation --- */}
        <div className="flex items-center gap-12">
          <Link
            to="/"
            className="group flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900"
          >
            <span>SEATZO</span>
            <span className="text-red-600 transition-transform duration-300 group-hover:scale-110">.</span>
          </Link>

          {/* Desktop Links - Clean Modern Style */}
          <div className="hidden xl:flex items-center gap-8">
            <div
              className="relative"
              onMouseEnter={() => setIsExploreOpen(true)}
              onMouseLeave={() => setIsExploreOpen(false)}
            >
              <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                Explore <ChevronDown size={16} className={`transition-transform duration-300 ${isExploreOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Modern Dropdown */}
              <AnimatePresence>
                {isExploreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full -left-6 w-96 pt-4"
                  >
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Link
                          to="/events"
                          className="col-span-2 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-red-600">All Events</p>
                              <p className="text-sm text-gray-600 mt-1">Browse the complete catalog</p>
                            </div>
                            <ArrowUpRight size={16} className="text-gray-400 group-hover:text-red-600" />
                          </div>
                        </Link>
                        {CATEGORIES.map((cat) => {
                          const IconComponent = cat.icon;
                          return (
                            <Link
                              key={cat.id}
                              to={`/events?category=${cat.id}`}
                              className="group p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                  <IconComponent size={20} className="text-red-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 group-hover:text-red-600">{cat.label}</p>
                                  <p className="text-sm text-gray-600">{cat.description}</p>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                      <Link
                        to="/events"
                        className="flex items-center justify-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors"
                      >
                        View All Events <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/about" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">About</Link>
            <Link to="/contact" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">Contact</Link>
          </div>
        </div>

        {/* --- Right: Search & Identity --- */}
        <div className="flex items-center gap-6">

          {/* Modern Search */}
          <div className={`hidden md:flex items-center bg-gray-100 rounded-full border transition-all duration-300 px-4 ${searchFocused ? 'w-80 bg-white border-gray-300 shadow-sm' : 'w-48'}`}>
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 group p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {token ? (
                <>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">Member</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold ring-2 ring-transparent group-hover:ring-red-200 transition-all">
                    {user?.name?.[0]}
                  </div>
                </>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 ring-2 ring-transparent group-hover:ring-gray-300 transition-all">
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
                  className="absolute right-0 mt-4 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 overflow-hidden"
                >
                  {token ? (
                    <>
                      <div className="p-4 mb-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Account Status</p>
                        <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-600"></div>
                          Active Member
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <User size={16} /> Profile
                      </Link>

                      <Link
                        to={user?.role === 'organiser' ? '/organizer-dashboard' : '/organizer-register'}
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                      >
                        <Ticket size={16} /> List Your Event
                      </Link>

                      {user?.role === 'organiser' && (
                        <Link
                          to="/organizer-dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 mb-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Welcome</p>
                        <p className="text-sm text-gray-700">Sign in to access all features</p>
                      </div>
                      <Link
                        to="/organizer-register"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                      >
                        <ArrowUpRight size={16} /> List Your Event
                      </Link>
                      <button
                        onClick={() => { dispatch(openAuthModal({ mode: 'login', role: 'customer' })); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <User size={16} /> Sign In
                      </button>
                      <button
                        onClick={() => { dispatch(openAuthModal({ mode: 'register', role: 'customer' })); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border-t border-gray-200 mt-2 pt-4"
                      >
                        <Ticket size={16} /> Create Account
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            className="xl:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
            className="fixed inset-0 h-screen bg-white z-50 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                SEATZO<span className="text-red-600">.</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X size={24}/>
              </button>
            </div>

            <div className="space-y-6 mb-12">
              <Link
                to="/events"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-4xl font-bold text-gray-900 hover:text-red-600 transition-colors"
              >
                All Events
              </Link>
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    to={`/events?category=${cat.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-2xl font-semibold text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <IconComponent size={24} />
                    {cat.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto space-y-4">
              <div className="h-px bg-gray-200 w-full mb-6" />
              <Link
                to="/organizer-register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center justify-between p-6 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <span className="text-lg font-semibold">List Your Event</span>
                <ArrowUpRight size={24} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;