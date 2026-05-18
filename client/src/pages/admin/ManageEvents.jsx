import { useState, useEffect } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/admin/events");
      setEvents(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Management</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            All <span className="text-slate-400">Events</span>
          </h1>
        </div>
        <div className="text-xs font-bold text-slate-400">
          Total Events: <span className="text-slate-900">{events.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => (
          <div key={event._id} className="bg-white border border-slate-200 rounded-[24px] p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
            <div className="flex items-center gap-6">
              <div className="w-20 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-xl shadow-slate-200/50">
                <img
                  src={event.posterUrl || "https://images.unsplash.com/photo-1514525253344-9914f25af042?auto=format&fit=crop&w=400&q=80"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={event.title}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-900 text-lg truncate">{event.title}</h3>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                    event.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                    event.status === 'DRAFT' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                    'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  }`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  {event.venue} · {event.city} · {formatDate(event.date)}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-[10px] font-bold text-rose-500">O</div>
                    <span className="text-[11px] text-slate-600 font-bold">{event.organiser?.name}</span>
                  </div>
                  <div className="h-3 w-px bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 uppercase tracking-tighter font-black">Tickets:</span>
                    <span className="text-[11px] text-slate-900 font-black">{event.availableSeats} / {event.totalSeats}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-100 transition-all">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
                <button className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl border border-rose-100 transition-all">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageEvents;
