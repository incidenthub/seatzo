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
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white tracking-tight">
          Seat<span className="text-violet-400">zo</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/events" className="text-zinc-400 hover:text-white text-sm transition-colors">
            Events
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">
                My Bookings
              </Link>
              <span className="text-zinc-500 text-sm border-l border-zinc-700 pl-6">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-zinc-400 hover:text-white text-sm transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;