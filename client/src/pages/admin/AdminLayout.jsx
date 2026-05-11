import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const NAV = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    to: "/admin/verify-organisers",
    label: "Verify Organisers",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M22 11l-5 5-2-2" />
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Manage Users",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    to: "/admin/events",
    label: "All Events",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Admin logged out");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#050505] font-sans selection:bg-rose-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .nav-link-admin { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:14px; font-size:14px; color:#71717a; text-decoration:none; transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1); font-weight: 500; }
        .nav-link-admin:hover { background:rgba(244,63,94,0.05); color:#fda4af; }
        .nav-link-admin.active { background:rgba(244,63,94,0.1); color:#f43f5e; font-weight: 700; box-shadow: inset 0 0 0 1px rgba(244,63,94,0.1); }
      `}</style>

      {/* Sidebar */}
      <aside className="w-72 bg-[#09090b] border-r border-white/5 flex flex-col p-6 fixed top-0 left-0 bottom-0 z-50">
        {/* Logo */}
        <div className="px-2 mb-10 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="font-syne text-2xl font-black text-white tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>
              Seat<span className="text-rose-500">zo</span>
            </span>
          </div>
          <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em] mt-2 ml-1">
            Admin Management
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link-admin">
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl mb-4 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] font-medium text-rose-400 uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-500 hover:text-rose-400 hover:bg-rose-400/5 transition-all group"
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

export default AdminLayout;
