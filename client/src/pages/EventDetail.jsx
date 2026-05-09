import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  AVAILABLE:    'bg-neutral-800 hover:bg-neutral-700 border-neutral-600 cursor-pointer text-neutral-300 hover:border-rose-500/50',
  LOCKED:       'bg-neutral-900 border-neutral-800 cursor-not-allowed text-neutral-700',
  BOOKED:       'bg-neutral-900 border-neutral-600 cursor-not-allowed text-neutral-600 opacity-40',
  DISABLED:     'bg-neutral-950 border-neutral-900 cursor-not-allowed text-neutral-800',
  SELECTED:     'bg-rose-500 border-rose-400 cursor-pointer text-white shadow-[0_0_10px_rgba(248,68,100,0.4)]',
  LOCKED_BY_ME: 'bg-rose-500 border-rose-400 cursor-pointer text-white shadow-[0_0_10px_rgba(248,68,100,0.4)]',
};

const POLL_MS = 3000;

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent]     = useState(null);
  const [seats, setSeats]     = useState([]);
  const [selected, setSelected] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);

  const selectedRef  = useRef([]);
  const pollRef      = useRef(null);
  const lockingRef   = useRef(false); // true while lock API call is in-flight
  const unmountedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { lockingRef.current  = locking;  }, [locking]);
  useEffect(() => () => { unmountedRef.current = true; }, []);

  const userId = user?._id?.toString();

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.event);
    } catch {
      toast.error('Failed to load event details');
    }
  };

const fetchSeats = useCallback(async () => {
    try {
      const res = await api.get(`/events/${id}/seats`);
      const freshSeats = res.data.seats;

      setPricing(res.data.pricing);
      setSeats(freshSeats);

      // Skip stolen-seat check while a lock request is in flight —
      // the seat will appear LOCKED by us in Redis but the UI hasn't
      // navigated yet, causing a false positive.
      if (lockingRef.current) return;

      const freshMap = Object.fromEntries(freshSeats.map((s) => [s._id, s]));

      const stolen = selectedRef.current.filter((sel) => {
        const live = freshMap[sel._id];
        if (!live) return true;
        if (live.status === 'AVAILABLE') return false;
        // normalise both sides — Redis stores plain strings, user._id may be ObjectId
        if (live.status === 'LOCKED' && live.lockedBy?.toString() === userId) return false;
        return true;
      });

      if (stolen.length > 0) {
        const names = stolen.map((s) => `Seat ${s.seatNumber}`).join(', ');
        toast.error(`${names} ${stolen.length === 1 ? 'was' : 'were'} just taken — auto-removed from your selection.`, {
          duration: 5000,
          icon: '⚠️',
        });
        setSelected((prev) => prev.filter((sel) => !stolen.find((st) => st._id === sel._id)));
      }
    } catch (err) {
      console.error('[fetchSeats]', err);
    }
  }, [id, userId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchEvent();
      await fetchSeats();
      setLoading(false);
    };
    init();
    pollRef.current = setInterval(fetchSeats, POLL_MS);
    return () => {
      unmountedRef.current = true;
      clearInterval(pollRef.current);
    };
  }, [id]);

  const handleSeatClick = (seat) => {
    const isLockedByMe = seat.status === 'LOCKED' && seat.lockedBy?.toString() === userId;
    if (seat.status !== 'AVAILABLE' && !isLockedByMe) return;
    if (selected.find((s) => s._id === seat._id)) {
      setSelected(selected.filter((s) => s._id !== seat._id));
    } else {
      if (selected.length >= 6) { toast.error('Max 6 seats per booking'); return; }
      setSelected([...selected, seat]);
    }
  };

  const handleLock = async () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    if (selected.length === 0) { toast.error('Select at least one seat'); return; }

    const idempotencyKey = uuidv4();
    setLocking(true);
    // Pause poll immediately — prevents false "seat taken" toasts while
    // the lock request is in flight and Redis already shows the seat as ours
    clearInterval(pollRef.current);

    try {
      const res = await api.post('/seats/lock', {
        eventId: id,
        seatIds: selected.map((s) => s._id),
      }, { headers: { 'Idempotency-Key': idempotencyKey } });

      toast.success('Seats locked — you have 5 minutes to complete checkout!');
      // Poll stays stopped — Checkout owns the lock lifecycle from here
      navigate('/checkout', {
        state: {
          eventId: id,
          selectedSeats: selected,
          event,
          pricing,
          idempotencyKey,
          lockExpiresAt: res.data.expiresAt,
        },
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to lock seats';
      const failedSeat = err.response?.data?.failedSeat;
      toast.error(msg);

      if (failedSeat) {
        setSelected((prev) => prev.filter((s) => s._id !== failedSeat));
      }

      // Restart poll now that the lock attempt is done
      setLocking(false);
      await fetchSeats();
      pollRef.current = setInterval(fetchSeats, POLL_MS);
      return; // skip finally setLocking(false) — already done
    }

    setLocking(false);
  };

  if (loading || !event) return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const SECTION_ORDER = ['DIAMOND', 'PLATINUM', 'VIP', 'PREMIUM', 'GOLD', 'SILVER', 'GENERAL'];
  const sections = Array.from(new Set(seats.map((s) => s.section))).sort((a, b) => {
    const idxA = SECTION_ORDER.indexOf(a), idxB = SECTION_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1; if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
  const totalPrice = selected.reduce((sum, s) => sum + (s.price || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3 { font-family: 'Syne', sans-serif; }
        @keyframes shimmer { to { transform: translateX(200%); } }
      `}</style>

      <div className="min-h-screen bg-white text-gray-900 dark:bg-neutral-950 dark:text-white transition-colors duration-200">

        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src={event.posterUrl || "https://images.unsplash.com/photo-1514525253344-9914f25af042?auto=format&fit=crop&w=1200&q=60"} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/80 to-neutral-950" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-44 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)] border border-white/10 shrink-0">
              <img src={event.posterUrl || "https://images.unsplash.com/photo-1514525253344-9914f25af042?auto=format&fit=crop&w=400&q=80"} alt={event.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 pt-2">
              <span className="inline-block bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                {event.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.95] text-white mb-4">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
                <span className="flex items-center gap-1.5 text-neutral-300 text-sm">
                  <svg className="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {event.venue}, {event.city}
                </span>
                <span className="flex items-center gap-1.5 text-neutral-400 text-sm">
                  <svg className="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <button className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Watch Trailer
              </button>
            </div>
          </div>
        </div>

        {/* Seat map + sidebar */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 flex flex-col lg:flex-row gap-6">

          {/* Seat Map */}
          <div className="flex-1 bg-gray-100/80 dark:bg-neutral-900/60 border border-gray-200 dark:border-white/5 rounded-2xl p-6 md:p-8">
            <div className="mb-10 text-center">
              <div className="relative inline-block w-full max-w-xs mx-auto">
                <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-rose-500/60 to-transparent rounded-full" />
                <div className="h-6 w-full bg-gradient-to-b from-rose-500/10 to-transparent rounded-b-3xl" />
              </div>
              <p className="text-[9px] text-neutral-600 font-black tracking-[0.3em] uppercase mt-1">Stage</p>
            </div>

            <div className="space-y-10 overflow-x-auto pb-4">
              {sections.map((section) => (
                <div key={section} className="min-w-max flex flex-col items-center">
                  <div className="mb-4 flex items-center gap-3 w-full">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-widest bg-gray-200/80 dark:bg-neutral-800/80 px-3 py-1 rounded-full border border-gray-300 dark:border-white/8">
                      {section} · ₹{(seats.find(s => s.section === section)?.price || 0) / 100}
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="space-y-2">
                    {Array.from(new Set(seats.filter(s => s.section === section).map(s => s.row))).sort().map(row => (
                      <div key={row} className="flex items-center gap-3">
                        <span className="w-5 text-[10px] font-bold text-gray-400 dark:text-neutral-600 text-center uppercase">{row}</span>
                        <div className="flex gap-1.5">
                          {Array.from(new Set(seats.filter(s => s.section === section && s.row === row).map(s => s.seatNumber)))
                            .sort((a, b) => (parseInt(a.replace(/[^\d]/g, '')) || 0) - (parseInt(b.replace(/[^\d]/g, '')) || 0))
                            .map(seatNo => {
                              const seat = seats.find(s => s.section === section && s.row === row && s.seatNumber === seatNo);
                              const isSelected   = !!selected.find(s => s._id === seat._id);
                              const isLockedByMe = seat.status === 'LOCKED' && seat.lockedBy?.toString() === userId;
                              const status = isSelected || isLockedByMe ? 'SELECTED' : seat.status;
                              return (
                                <button
                                  key={seat._id}
                                  onClick={() => handleSeatClick(seat)}
                                  disabled={seat.status !== 'AVAILABLE' && !isLockedByMe}
                                  title={`${seat.seatNumber} · ₹${seat.price / 100}`}
                                  className={`w-7 h-7 rounded-lg border text-[9px] font-bold transition-all duration-150 flex items-center justify-center ${STATUS_COLORS[status]}`}
                                >
                                  {seatNo.replace(seat.row, '')}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-10 pt-6 border-t border-white/5 flex justify-center gap-6 flex-wrap">
              {[
                { label: 'Available', cls: 'bg-neutral-800 border-neutral-600' },
                { label: 'Selected',  cls: 'bg-rose-500 border-rose-400' },
                { label: 'Locked',    cls: 'bg-neutral-900 border-neutral-800' },
                { label: 'Booked',    cls: 'bg-neutral-900 border-neutral-800 opacity-40' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-md border ${l.cls}`} />
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-gray-100/80 dark:bg-neutral-900/60 border border-gray-200 dark:border-white/5 rounded-2xl p-6 sticky top-20">
              <h2 className="text-lg font-black text-gray-900 dark:text-white mb-5 tracking-tight">Booking Summary</h2>

              {selected.length > 0 ? (
                <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-1">
                  {selected.map(seat => (
                    <div key={seat._id} className="flex items-center justify-between bg-gray-200/60 dark:bg-neutral-800/60 border border-gray-300/50 dark:border-white/5 p-3 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Seat {seat.seatNumber}</p>
                        <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wider">{seat.section}</p>
                      </div>
                      <span className="text-sm font-black text-rose-400">₹{seat.price / 100}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-gray-300 dark:border-white/8 rounded-xl mb-6 bg-gray-200/30 dark:bg-neutral-800/20">
                  <svg className="w-8 h-8 text-neutral-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                  </svg>
                  <p className="text-neutral-500 text-xs font-medium">Tap seats on the map<br/>to pick your spot</p>
                </div>
              )}

              <div className="border-t border-white/5 pt-5 mb-5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-widest font-bold mb-1">Total</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">₹{totalPrice / 100}</p>
                  </div>
                  {selected.length > 0 && (
                    <span className="text-[11px] text-neutral-500">{selected.length} seat{selected.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLock}
                disabled={selected.length === 0 || locking}
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-200 ${
                  selected.length === 0 || locking
                    ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                    : 'bg-rose-500 hover:bg-rose-400 text-white hover:shadow-[0_0_30px_rgba(248,68,100,0.4)] hover:-translate-y-px active:scale-95'
                }`}
              >
                {locking
                  ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Securing…</span>
                  : `Book ${selected.length || ''} Ticket${selected.length !== 1 ? 's' : ''}`}
              </button>
              <p className="text-[10px] text-center text-gray-400 dark:text-neutral-600 font-medium mt-3">
                Seats held for 5 minutes after booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetail;