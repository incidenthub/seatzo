import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-4 md:px-8 py-0 sticky top-0 z-[60] transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 gap-6">

         <Link
          to="/"
          className="text-xl font-black tracking-tighter text-gray-900 dark:text-white flex-shrink-0 flex items-center gap-0.5 hover:opacity-90 transition-opacity"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          SEAT<span className="text-rose-500">ZO</span>
        </Link>

        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search movies, events, plays, sports…"
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/8 hover:border-gray-300 dark:hover:border-white/15 focus:border-rose-500/70 dark:focus:border-rose-500/50 rounded-xl px-10 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:bg-white dark:focus:bg-white/8 transition-all duration-200"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500 group-focus-within:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {(!user || user.role !== 'organiser') && (
            <Link to="/events" className="hidden sm:block text-[13px] font-semibold text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/6 transition-all duration-200">
              Events
            </Link>
          )}

          {user ? (
            <>
              {user.role === 'organiser' && (
                <Link to="/organiser/events" className="text-[13px] font-semibold text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/6 transition-all duration-200">
                  Dashboard
                </Link>
              )}
              {user.role === 'customer' && (
                <Link to="/dashboard" className="text-[13px] font-semibold text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/6 transition-all duration-200">
                  My Bookings
                </Link>
              )}
              <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200 dark:border-white/8">
                <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase">{user.name?.[0] ?? 'U'}</span>
                </div>
                <span className="hidden sm:block text-[13px] font-semibold text-gray-800 dark:text-white/80 max-w-[100px] truncate">{user.name}</span>
                <button onClick={handleLogout} className="text-[12px] font-bold text-gray-400 dark:text-neutral-500 hover:text-rose-500 dark:hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/8 transition-all duration-200">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link to="/login" className="text-[13px] font-semibold text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/6 transition-all duration-200">
                Sign In
              </Link>
              <Link to="/register" className="text-[13px] font-black text-white bg-rose-500 hover:bg-rose-400 px-4 py-1.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(248,68,100,0.35)] hover:-translate-y-px active:scale-95">
                Join Now
              </Link>
            </div>
          )}

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-2 w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/8 hover:border-rose-300 dark:hover:border-rose-500/30 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-200"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;