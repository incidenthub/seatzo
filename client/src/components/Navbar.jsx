import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import Logo from "../components/Logo"

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
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative group">
            <input
              type="text"
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
          </div>
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