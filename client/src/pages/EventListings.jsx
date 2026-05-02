import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

const CATEGORIES = ['all', 'movie', 'music', 'concert', 'sports', 'theatre', 'standup', 'conference'];

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

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatPrice = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#333]">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200 px-6 py-12 text-center">
        <h1 className="text-4xl font-black mb-3 tracking-tight text-[#333]">Events In Your City</h1>
        <p className="text-gray-500 font-medium">From big concerts to small workshops, find it all here.</p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 items-center mb-10 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          {/* City search */}
          <div className="relative">
            <input
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="Search by city..."
              className="bg-gray-50 border border-gray-200 text-[#333] rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#f84464] w-56 transition-all"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: cat })}
                className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition-all border ${
                  filters.category === cat
                    ? 'bg-[#f84464] border-[#f84464] text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#f84464] hover:text-[#f84464]'
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
            className="bg-white border border-gray-200 text-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#f84464] ml-auto font-medium"
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
            <option value="popularity">Sort by Popularity</option>
          </select>
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#f84464] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
            <span className="text-5xl mb-4 block">🎫</span>
            <p className="text-gray-500 font-medium">No events found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {events.map((event) => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100"
              >
                {/* Poster container */}
                <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden">
                  {event.posterUrl ? (
                    <img 
                      src={event.posterUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-5xl">🎟️</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-[#f84464] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                    {event.category}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-[#333] text-lg mb-1 line-clamp-1 group-hover:text-[#f84464] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-500 text-xs mb-4 font-medium">{event.venue}, {event.city}</p>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Price</span>
                        <span className="text-[#333] font-black text-sm">
                          {formatPrice(event.basePrice)} <span className="text-[10px] text-gray-500 font-normal">onwards</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-[#f84464] font-bold bg-[#fef2f2] px-2 py-1 rounded">
                        {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#4ade80] h-full rounded-full transition-all duration-1000"
                            style={{ width: `${Math.max(10, (event.availableSeats / event.totalSeats) * 100)}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-[10px] font-bold shrink-0">{event.availableSeats} LEFT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-3 mt-16">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchEvents(p)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all shadow-sm ${
                  p === pagination.page
                    ? 'bg-[#f84464] text-white shadow-[#f84464]/20'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#f84464] hover:text-[#f84464]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventListings;