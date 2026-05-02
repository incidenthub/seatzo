import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";

const Skeleton = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-gray-200 dark:bg-neutral-800/60 rounded-xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-gray-300/40 dark:via-white/5 to-transparent" />
  </div>
);

const EventItem = ({ event }) => (
  <Link
    to={`/events/${event._id}`}
    className="group relative flex flex-col bg-gray-50 dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 hover:border-rose-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-10px_rgba(248,68,100,0.2)]"
  >
    <div className="relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-neutral-800">
      <img
        src={event.posterUrl || "https://images.unsplash.com/photo-1514525253344-9914f25af042?auto=format&fit=crop&w=400&q=80"}
        alt={event.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
        {event.category}
      </span>
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <span className="block text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">{event.city}</span>
        <p className="text-white text-xs leading-relaxed line-clamp-2">{event.venue}</p>
      </div>
    </div>
    <div className="p-4 flex flex-col gap-1 flex-1">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{event.title}</h3>
      <p className="text-xs text-gray-400 dark:text-neutral-500 truncate">{event.venue}</p>
      <div className="mt-auto pt-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider">From</span>
          <p className="text-base font-black text-gray-900 dark:text-white leading-none">₹{Math.round(event.basePrice / 100)}</p>
        </div>
        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20">
          Book Now →
        </span>
      </div>
    </div>
  </Link>
);

const SectionHeader = ({ title, href }) => (
  <div className="flex items-end justify-between mb-8">
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{title}</h2>
      <div className="mt-2 h-0.5 w-12 bg-rose-500 rounded-full" />
    </div>
    <Link
      to={href}
      className="text-xs font-bold text-gray-400 dark:text-neutral-500 hover:text-rose-400 transition-colors uppercase tracking-widest flex items-center gap-1 group"
    >
      View All
      <span className="group-hover:translate-x-0.5 transition-transform inline-block">›</span>
    </Link>
  </div>
);

const HeroCarousel = ({ events }) => {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);
  const slides = events.length > 0 ? events.slice(0, 5) : null;

  useEffect(() => {
    if (!slides) return;
    timerRef.current = setInterval(() => setActive(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [slides?.length]);

  if (!slides) {
    return (
      <div className="relative h-[520px] md:h-[600px] rounded-3xl overflow-hidden bg-gray-200 dark:bg-neutral-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 dark:from-black/90 dark:via-black/50 to-transparent" />
        <div className="text-center px-8 z-10 relative">
          <p className="text-rose-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Live Experiences</p>
          <h1 className="font-black text-white text-5xl md:text-7xl leading-[0.95] tracking-tighter mb-6">
            Experience<br /><span className="text-rose-500">Magic</span><br />Live
          </h1>
          <p className="text-white/70 text-base max-w-sm mx-auto mb-8">Book tickets for the most anticipated events in your city.</p>
          <Link to="/events" className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all duration-200 hover:shadow-[0_0_40px_rgba(248,68,100,0.4)] hover:-translate-y-0.5">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const current = slides[active];

  return (
    <div className="relative h-[520px] md:h-[600px] rounded-3xl overflow-hidden">
      {slides.map((s, i) => (
        <div key={s._id} className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}>
          <img
            src={s.posterUrl || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1400&q=80"}
            alt=""
            className="w-full h-full object-cover scale-105"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-14">
        <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3 block">{current.category}</span>
        <h1 className="font-black text-white text-4xl md:text-6xl leading-[0.95] tracking-tighter max-w-xl mb-3 [text-shadow:0_2px_20px_rgba(0,0,0,0.5)]">
          {current.title}
        </h1>
        <p className="text-white/70 text-sm mb-2">{current.venue} · {current.city}</p>
        <p className="text-white/50 text-sm mb-8">From <span className="text-white font-black text-xl">₹{Math.round(current.basePrice / 100)}</span></p>
        <div className="flex items-center gap-4">
          <Link to={`/events/${current._id}`} className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-black text-sm px-8 py-3.5 rounded-2xl transition-all duration-200 hover:shadow-[0_0_40px_rgba(248,68,100,0.4)] hover:-translate-y-0.5">
            Book Tickets
          </Link>
          <Link to="/events" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
            All Events →
          </Link>
        </div>
        <div className="flex items-center gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); clearInterval(timerRef.current); }}
              className={`transition-all duration-300 rounded-full ${i === active ? "w-8 h-2 bg-rose-500" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const CategoryIcons = {
  movie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/>
    </svg>
  ),
  music: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="8" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M11 18V7l9-2v9"/>
    </svg>
  ),
  comedy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 3 4 3 4-3 4-3"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
  sports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>
    </svg>
  ),
  theatre: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M2 10s3-3 3-8h14c0 5 3 8 3 8"/><path d="M6 15s1.5 2 6 2 6-2 6-2"/><path d="M2 10h20v4a8 8 0 0 1-16 0v-4z"/>
    </svg>
  ),
  festival: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="13.5" cy="6.5" r="2.5"/><path d="M17.5 13a4.5 4.5 0 0 0-9 0"/><path d="M3 21l4-4m14 4-4-4"/><path d="M12 17v4"/><rect x="3" y="3" width="5" height="5" rx="1"/><path d="M21 7l-3 3-3-3"/>
    </svg>
  ),
  conference: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

const CATEGORIES = [
  { name: "Movies", slug: "movie" },
  { name: "Music", slug: "music" },
  { name: "Comedy", slug: "comedy" },
  { name: "Sports", slug: "sports" },
  { name: "Plays", slug: "theatre" },
  { name: "Workshops", slug: "festival" },
  { name: "Conferences", slug: "conference" },
];

const EmptyState = ({ message }) => (
  <div className="col-span-full text-center py-16 text-gray-400 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-900/40 rounded-2xl border border-gray-200 dark:border-white/5">
    {message}
  </div>
);

const LandingPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events?limit=20");
        setEvents(res.data.events || []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filterByCategory = (slug) => events.filter(e => e.category === slug);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;700&display=swap');
        @keyframes shimmer { to { transform: translateX(200%); } }
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3, .font-black { font-family: 'Syne', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-white text-gray-900 dark:bg-neutral-950 dark:text-white transition-colors duration-200">

        {/* Categories Strip */}
        <div className="sticky top-14 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-3 no-scrollbar">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/events?category=${cat.slug}`}
                  className="group flex items-center gap-2 flex-shrink-0 px-4 py-2.5 rounded-xl text-gray-500 dark:text-neutral-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/8 transition-all duration-200"
                >
                  <span className="transition-colors duration-200">{CategoryIcons[cat.slug]}</span>
                  <span className="text-[13px] font-semibold whitespace-nowrap">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">

          {/* Hero */}
          <div className="py-6">
            {loading ? <Skeleton className="h-[520px] md:h-[600px] rounded-3xl" /> : <HeroCarousel events={events} />}
          </div>

          {/* Recommended Movies */}
          <section className="py-12 border-t border-gray-200 dark:border-white/5">
            <SectionHeader title="Recommended Movies" href="/events?category=movie" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {loading
                ? [...Array(5)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />)
                : filterByCategory("movie").length > 0
                  ? filterByCategory("movie").slice(0, 5).map(event => <EventItem key={event._id} event={event} />)
                  : <EmptyState message="No movies currently listed." />
              }
            </div>
          </section>

          {/* Best of Live Events */}
          <section className="py-12 border-t border-gray-200 dark:border-white/5">
            <SectionHeader title="Best of Live Events" href="/events" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {loading
                ? [...Array(10)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />)
                : events.filter(e => e.category !== "movie").slice(0, 10).map(event => <EventItem key={event._id} event={event} />)
              }
            </div>
          </section>

          {/* Stream Banner */}
          <div className="py-4 border-t border-gray-200 dark:border-white/5">
            <div className="rounded-2xl overflow-hidden">
              <img
                src="https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-1440,h-120/stream-le-collection-202210241242.png"
                alt="Stream"
                className="w-full object-cover"
              />
            </div>
          </div>

          {/* Comedy Shows */}
          <section className="py-12 border-t border-gray-200 dark:border-white/5">
            <SectionHeader title="Laughter Therapy" href="/events?category=comedy" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {loading
                ? [...Array(5)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />)
                : filterByCategory("comedy").length > 0
                  ? filterByCategory("comedy").slice(0, 5).map(event => <EventItem key={event._id} event={event} />)
                  : <EmptyState message="No comedy events currently listed." />
              }
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <section className="relative mt-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100/60 dark:from-rose-950/60 via-gray-50 dark:via-neutral-900 to-white dark:to-neutral-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-24">
            <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Get Started</p>
            <h2 className="font-black text-5xl md:text-6xl text-gray-900 dark:text-white tracking-tight leading-[0.95] mb-5">
              Ready to experience<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">magic?</span>
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 text-base mb-10 max-w-sm mx-auto">
              Join thousands of event-goers and organisers today.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-black text-base px-10 py-4 rounded-2xl transition-all duration-200 hover:shadow-[0_0_60px_rgba(248,68,100,0.4)] hover:-translate-y-0.5 active:scale-95"
            >
              Browse Events Now
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default LandingPage;