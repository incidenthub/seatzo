import { useState, useEffect } from "react";
import api from "../../utils/axios";

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-[#0e0e11] border border-white/5 p-6 rounded-[24px] hover:border-white/10 transition-all group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">{label}</p>
        <h3 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, events: 0, revenue: 0, bookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (paise) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Loading Platform Stats...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Platform Overview</p>
        <h1 className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Good Morning, <span className="text-neutral-500">Admin</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={stats.users}
          color="bg-blue-500 text-blue-500"
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>}
        />
        <StatCard
          label="Live Events"
          value={stats.events}
          color="bg-purple-500 text-purple-500"
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>}
        />
        <StatCard
          label="Total Bookings"
          value={stats.bookings}
          color="bg-emerald-500 text-emerald-500"
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>}
        />
        <StatCard
          label="Total Revenue"
          value={formatPrice(stats.revenue)}
          color="bg-rose-500 text-rose-500"
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-[#0e0e11] border border-white/5 rounded-[32px] p-8">
          <h3 className="text-xl font-black text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-white/5">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M22 11l-5 5-2-2" /></svg>
              </div>
              <span className="text-xs font-bold text-neutral-400">Verify Organisers</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-white/5">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
              </div>
              <span className="text-xs font-bold text-neutral-400">Manage Users</span>
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-[#0e0e11] border border-white/5 rounded-[32px] p-8">
          <h3 className="text-xl font-black text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>Platform Health</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-neutral-300">API Server</span>
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-widest">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-neutral-300">Database</span>
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-widest">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-neutral-300">Email Service</span>
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-widest">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
