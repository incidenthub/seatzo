import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-[#333333] tracking-tighter flex items-center gap-1">
          <span className="text-[#f84464]">S</span>EATZO
        </Link>

        <div className="flex-1 max-w-xl mx-12 hidden md:block">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for Movies, Events, Plays, Sports and Activities"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#f84464] focus:border-transparent transition-all"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {(!user || user.role !== 'organiser') && (
            <Link to="/events" className="text-gray-600 hover:text-[#f84464] text-sm font-medium transition-colors">
              Events
            </Link>
          )}

          {user ? (
            <>
              {user.role === 'organiser' && (
                <Link to="/organiser/events" className="text-gray-600 hover:text-[#f84464] text-sm font-medium transition-colors">
                  Dashboard
                </Link>
              )}
              {user.role === 'customer' && (
                <Link to="/dashboard" className="text-gray-600 hover:text-[#f84464] text-sm font-medium transition-colors">
                  My Bookings
                </Link>
              )}
              <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                <span className="text-gray-900 text-sm font-semibold">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-[#f84464] text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm bg-[#f84464] hover:bg-[#d63955] text-white px-5 py-2 rounded-lg font-bold transition-colors shadow-sm"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;