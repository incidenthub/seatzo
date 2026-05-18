import { NavLink, Outlet, useNavigate } from 'react-router-dom';
// OrganiserLayout uses <Outlet /> — nested routes render inside main content area
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  {
    to: '/organiser/events',
    label: 'My Events',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    to: '/organiser/events/create',
    label: 'Create Event',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
];

const OrganiserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .nav-link-org { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:14px; font-size:14px; color:#64748b; text-decoration:none; transition:all 0.2s; font-weight: 500; }
        .nav-link-org:hover { background:rgba(124,58,237,0.05); color:#7c3aed; }
        .nav-link-org.active { background:white; color:#7c3aed; font-weight: 700; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05); border: 1px solid #f1f5f9; }
      `}</style>

      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 fixed top-0 left-0 bottom-0 z-50">
        {/* Logo */}
        <div className="px-2 mb-10 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="font-syne text-2xl font-black text-slate-900 tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>
              Seat<span className="text-purple-600">zo</span>
            </span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 ml-1">
            Organiser Dashboard
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/organiser/events'} className="nav-link-org">
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] font-medium text-purple-600 uppercase tracking-wider">Official Organiser</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all group"
          >
            <svg className="group-hover:rotate-12 transition-transform" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-10 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OrganiserLayout;