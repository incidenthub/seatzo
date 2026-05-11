import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import Logo from "../components/Logo"
import api from "../utils/axios";

const SunIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const navLinkClass =
  "text-[13px] font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all duration-200";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await api.get("/events", { params: { search: query.trim(), limit: 5 } });
      setSuggestions(res.data.events || []);
    } catch (err) {
      setSuggestions([]);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setShowDropdown(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSuggestionClick = (eventId) => {
    setShowDropdown(false);
    setSearch("");
    navigate(`/events/${eventId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setShowDropdown(false);
      navigate(`/events?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 px-4 md:px-8 sticky top-0 z-[60] transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 gap-6">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
  <Logo className="h-12 w-12" />
</Link>

        {/* Search */}
        <div className="flex-1 max-w-lg hidden md:block" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search movies, events, plays, sports…"
              className="w-full bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-rose-500/70 dark:focus:border-rose-500/50 rounded-xl px-10 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:bg-white dark:focus:bg-white/[0.08] transition-all duration-200"
            />

            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 group-focus-within:text-rose-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            </form>

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                {suggestions.map((event) => (
                  <button
                    key={event._id}
                    onClick={() => handleSuggestionClick(event._id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors text-left"
                  >
                    {event.posterUrl ? (
                      <img src={event.posterUrl} alt="" className="w-10 h-12 object-cover rounded-lg" />
                    ) : (
                      <div className="w-10 h-12 bg-zinc-100 dark:bg-white/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{event.title}</p>
                      <p className="text-xs text-neutral-500 truncate">{event.venue}, {event.city}</p>
                    </div>
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full capitalize">
                      {event.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1">

          {/* Public Links */}
          {(!user || user.role !== "organiser") && (
            <Link to="/events" className={navLinkClass}>
              Events
            </Link>
          )}

          {user ? (
            <>
              {/* Organiser */}
              {user.role === "organiser" && (
                <Link
                  to="/organiser/events"
                  className={navLinkClass}
                >
                  Dashboard
                </Link>
              )}

              {/* Customer */}
              {user.role === "customer" && (
                <Link
                  to="/dashboard"
                  className={navLinkClass}
                >
                  My Bookings
                </Link>
              )}

              {/* User */}
              <div className="flex items-center gap-2 ml-2 pl-3 border-l border-zinc-200 dark:border-white/8">

                <div className="w-7 h-7 rounded-full bg-rose-500/15 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase">
                    {user.name?.[0] ?? "U"}
                  </span>
                </div>

                <span className="hidden sm:block text-[13px] font-semibold text-neutral-800 dark:text-white/80 max-w-[100px] truncate">
                  {user.name}
                </span>

                <button
                  onClick={handleLogout}
                  className="text-[12px] font-bold text-neutral-400 dark:text-neutral-500 hover:text-rose-500 dark:hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-1">

              <Link
                to="/login"
                className={navLinkClass}
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="text-[13px] font-black text-white bg-rose-500 hover:bg-rose-400 px-4 py-1.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(248,68,100,0.35)] hover:-translate-y-px active:scale-95"
              >
                Join Now
              </Link>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-2 w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/8 hover:border-rose-300 dark:hover:border-rose-500/30 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-200"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;