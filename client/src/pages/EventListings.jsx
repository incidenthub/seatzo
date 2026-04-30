import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

const CATEGORIES = ['all', 'movie', 'concert', 'sports', 'theatre', 'standup'];

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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-violet-950/50 to-zinc-950 px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-3">Discover Events</h1>
        <p className="text-zinc-400">Concerts, movies, sports and more</p>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-3 items-center mb-8">
          {/* City search */}
          <input
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            placeholder="Filter by city..."
            className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500 w-48"
          />

          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: cat })}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                  filters.category === cat
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
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
            className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500 ml-auto"
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
            <option value="popularity">Sort by Popularity</option>
          </select>
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            No events found. Try changing your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all group"
              >
                {/* Poster placeholder */}
                <div className="h-44 bg-gradient-to-br from-violet-900/40 to-zinc-800 flex items-center justify-center">
                  {event.posterUrl ? (
                    <img 
                      src={event.posterUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                          const span = document.createElement('span');
                          span.className = 'text-4xl';
                          span.innerText = '🎟️';
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-4xl">🎟️</span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <span className="text-xs bg-violet-900/50 text-violet-300 px-2 py-1 rounded-md capitalize shrink-0">
                      {event.category}
                    </span>
                  </div>

                  <p className="text-zinc-500 text-xs mb-3">{event.venue}, {event.city}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-xs">{formatDate(event.date)}</span>
                    <span className="text-violet-400 font-semibold text-sm">
                      from {formatPrice(event.basePrice)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-zinc-800 rounded-full h-1">
                      <div
                        className="bg-violet-500 h-1 rounded-full"
                        style={{ width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%` }}
                      />
                    </div>
                    <span className="text-zinc-500 text-xs">{event.availableSeats} left</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchEvents(p)}
                className={`w-9 h-9 rounded-lg text-sm transition-colors ${
                  p === pagination.page
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
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