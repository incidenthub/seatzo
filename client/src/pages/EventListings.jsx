import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

const CATEGORIES = ['all', 'movie', 'music', 'concert', 'sports', 'theatre', 'standup', 'conference'];

const Skeleton = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-neutral-800/60 rounded-2xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
  </div>
);

const EventListings = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', category: 'all', sort: 'date' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchEvents = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort: filters.sort };
      if (filters.city) params.city = filters.city;
      if (filters.category !== 'all') params.category = filters.category;
      const res = await api.get('/events', { params });
      setEvents(res.data.events);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [filters]);

  const formatPrice = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;

  return (
    <>
      <style>{`@keyframes shimmer { to { transform: translateX(200%); } }`}</style>

      <div className="min-h-screen bg-white text-gray-900 dark:bg-neutral-950 dark:text-white transition-colors duration-200">

        {/* Hero */}
        <div className="relative overflow-hidden border-b border-gray-200 dark:border-white/5 px-6 py-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-100/40 dark:from-rose-950/20 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-rose-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Discover</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
              Events In Your City
            </h1>
            <p className="text-gray-500 dark:text-neutral-400 text-sm font-medium">From big concerts to small workshops, find it all here.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center mb-10 bg-gray-100/80 dark:bg-neutral-900/60 border border-gray-200 dark:border-white/5 backdrop-blur-sm p-4 rounded-2xl">

            {/* City search */}
            <div className="relative group">
              <input
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="Search by city…"
                className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/8 hover:border-gray-400 dark:hover:border-white/15 focus:border-rose-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-gray-50 dark:focus:bg-white/8 transition-all duration-200 w-52"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-rose-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters({ ...filters, category: cat })}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold capitalize transition-all duration-200 border ${
                    filters.category === cat
                      ? 'bg-rose-500 border-rose-500 text-white shadow-[0_0_16px_rgba(248,68,100,0.3)]'
                      : 'bg-transparent border-white/10 text-neutral-400 hover:border-rose-500/40 hover:text-rose-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="ml-auto bg-white dark:bg-white/5 border border-gray-300 dark:border-white/8 text-gray-700 dark:text-neutral-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500/50 transition-all cursor-pointer"
            >
              <option value="date" className="bg-white dark:bg-neutral-900">Sort by Date</option>
              <option value="price" className="bg-white dark:bg-neutral-900">Sort by Price</option>
              <option value="popularity" className="bg-white dark:bg-neutral-900">Sort by Popularity</option>
            </select>
          </div>

          {/* Results count */}
          {!loading && events.length > 0 && (
            <p className="text-gray-400 dark:text-neutral-500 text-xs font-semibold uppercase tracking-widest mb-6">
              {pagination.total} events found
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-[2/3]" />
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-3 w-1/2 rounded-lg" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-28 bg-gray-100 dark:bg-neutral-900/40 rounded-2xl border border-gray-200 dark:border-white/5">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <p className="text-white font-bold mb-1">No events found</p>
              <p className="text-neutral-500 text-sm">Try adjusting your filters or search a different city.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {events.map((event) => {
                const seatsPercent = Math.max(10, (event.availableSeats / event.totalSeats) * 100);
                const isLow = seatsPercent < 25;
                return (
                  <Link
                    key={event._id}
                    to={`/events/${event._id}`}
                    className="group flex flex-col bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 hover:border-rose-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-10px_rgba(248,68,100,0.2)]"
                  >
                    {/* Poster */}
                    <div className="aspect-[2/3] relative overflow-hidden bg-neutral-800">
                      {event.posterUrl ? (
                        <img
                          src={event.posterUrl}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-700">
                          <svg className="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        {event.category}
                      </span>
                      <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                        {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1 gap-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight line-clamp-1 group-hover:text-rose-400 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-400 dark:text-neutral-500 text-xs truncate">{event.venue}, {event.city}</p>

                      <div className="mt-auto pt-3 space-y-3">
                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-[10px] text-gray-400 dark:text-neutral-600 uppercase tracking-wider block">From</span>
                            <span className="text-gray-900 dark:text-white font-black text-base leading-none">{formatPrice(event.basePrice)}</span>
                          </div>
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-full">
                            Book →
                          </span>
                        </div>

                        {/* Seat bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLow ? 'text-amber-400' : 'text-neutral-600'}`}>
                              {isLow ? '⚡ Filling fast' : `${event.availableSeats} seats left`}
                            </span>
                          </div>
                          <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${isLow ? 'bg-amber-400' : 'bg-emerald-500'}`}
                              style={{ width: `${seatsPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-16">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchEvents(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
                    p === pagination.page
                      ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(248,68,100,0.35)]'
                      : 'bg-neutral-900 border border-white/8 text-neutral-400 hover:border-rose-500/40 hover:text-rose-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventListings;