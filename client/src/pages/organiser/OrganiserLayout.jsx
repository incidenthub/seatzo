import { NavLink, Outlet, useNavigate } from 'react-router-dom';
// OrganiserLayout uses <Outlet /> — nested routes render inside main content area
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  {
    to: '/organiser/events',
    label: 'My Events',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    to: '/organiser/events/create',
    label: 'Create Event',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090b', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .nav-link { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; font-size:14px; color:#71717a; text-decoration:none; transition:all 0.15s; }
        .nav-link:hover { background:rgba(124,58,237,0.08); color:#c084fc; }
        .nav-link.active { background:rgba(124,58,237,0.15); color:#c084fc; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#111113',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px', position: 'fixed',
        top: 0, left: 0, bottom: 0, zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ paddingLeft: 8, marginBottom: 32 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#fafafa' }}>
            Seat<span style={{ color: '#c084fc' }}>zo</span>
          </span>
          <div style={{ fontSize: 11, color: '#52525b', marginTop: 2, letterSpacing: 1, textTransform: 'uppercase' }}>
            Organiser Portal
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/organiser/events'}
              className="nav-link"
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingLeft: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#c084fc', fontSize: 13, fontWeight: 600,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#fafafa', fontWeight: 500 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#52525b' }}>Organiser</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '9px 14px', borderRadius: 10,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
              color: '#71717a', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 240, flex: 1, padding: '40px 40px', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default OrganiserLayout;