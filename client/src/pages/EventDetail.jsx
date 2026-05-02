import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  AVAILABLE: 'bg-white hover:bg-gray-50 border-gray-300 cursor-pointer text-[#333]',
  LOCKED: 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400',
  BOOKED: 'bg-gray-200 border-gray-300 cursor-not-allowed text-gray-400',
  DISABLED: 'bg-gray-50 border-gray-100 cursor-not-allowed text-gray-300',
  SELECTED: 'bg-[#f84464] border-[#f84464] cursor-pointer text-white ring-2 ring-[#f84464]/30',
  LOCKED_BY_ME: 'bg-[#f84464] border-[#f84464] cursor-pointer text-white ring-2 ring-[#f84464]/30',
};

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const pollRef = useRef(null);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.event);
    } catch (err) {
      toast.error('Failed to load event details');
    }
  };

  const fetchSeats = async () => {
    try {
      const res = await api.get(`/seats/${id}`);
      setSeats(res.data.seats);
      setPricing(res.data.pricing);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchEvent();
      await fetchSeats();
      setLoading(false);
    };
    init();

    pollRef.current = setInterval(fetchSeats, 5000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  const handleSeatClick = (seat) => {
    const lockedByMe = seat.status === 'LOCKED' && seat.lockedBy === user?._id?.toString();
    if (seat.status !== 'AVAILABLE' && !lockedByMe) return;

    if (selected.find((s) => s._id === seat._id)) {
      setSelected(selected.filter((s) => s._id !== seat._id));
    } else {
      if (selected.length >= 6) { toast.error('Max 6 seats per booking'); return; }
      setSelected([...selected, seat]);
    }
  };

  const handleLock = async () => {
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    if (selected.length === 0) {
      toast.error('Select at least one seat');
      return;
    }

    const idempotencyKey = uuidv4();
    setLocking(true);
    try {
      await api.post(
        '/seats/lock',
        {
          eventId: id,
          seatIds: selected.map((s) => s._id),
        },
        {
          headers: { 'Idempotency-Key': idempotencyKey },
        }
      );

      toast.success('Seats locked for 5 minutes!');
      navigate('/checkout', {
        state: {
          eventId: id,
          selectedSeats: selected,
          event,
          pricing,
          idempotencyKey,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to lock seats');
    } finally {
      setLocking(false);
    }
  };

  if (loading || !event) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#f84464] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const SECTION_ORDER = ['DIAMOND', 'PLATINUM', 'VIP', 'PREMIUM', 'GOLD', 'SILVER', 'GENERAL'];
  const sections = Array.from(new Set(seats.map((s) => s.section))).sort((a, b) => {
    const idxA = SECTION_ORDER.indexOf(a);
    const idxB = SECTION_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
  const totalPrice = selected.reduce((sum, s) => sum + (s.price || 0), 0);

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      {/* Event Header */}
      <div className="bg-[#333545] text-white py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-64 aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden shadow-2xl shrink-0">
             <img src={event.posterUrl || "https://images.unsplash.com/photo-1514525253344-9914f25af042?auto=format&fit=crop&w=400&q=80"} alt={event.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-black mb-4 tracking-tight">{event.title}</h1>
            <div className="flex flex-wrap gap-4 mb-6">
              <span className="bg-[#f84464] px-3 py-1 rounded text-xs font-bold uppercase">{event.category}</span>
              <span className="text-gray-300 font-medium">{event.venue}, {event.city}</span>
              <span className="text-gray-300 font-medium">| {new Date(event.date).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <p className="text-gray-400 max-w-2xl text-sm leading-relaxed mb-8">{event.description}</p>
            <div className="flex gap-4">
               <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-md font-bold text-sm transition-all border border-white/10">Share</button>
               <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-md font-bold text-sm transition-all border border-white/10">Watch Trailer</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">
        {/* Seat Map */}
        <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="mb-10 text-center">
            <div className="inline-block w-full max-w-md h-2 bg-gray-200 rounded-full mb-2 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f84464]/20 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
            <p className="text-[10px] text-gray-400 font-black tracking-[0.3em] uppercase">All eyes this way please!</p>
          </div>

          <div className="space-y-12 overflow-x-auto pb-8">
            {sections.map((section) => (
              <div key={section} className="min-w-max flex flex-col items-center">
                <div className="mb-4 flex items-center gap-3 w-full">
                  <div className="h-[1px] flex-1 bg-gray-100" />
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    {section} — ₹{(seats.find(s => s.section === section)?.price || 0) / 100}
                  </span>
                  <div className="h-[1px] flex-1 bg-gray-100" />
                </div>
                
                <div className="space-y-2">
                  {Array.from(new Set(seats.filter(s => s.section === section).map(s => s.row))).sort().map(row => (
                    <div key={row} className="flex items-center gap-4">
                      <span className="w-6 text-[10px] font-bold text-gray-400 text-center uppercase">{row}</span>
                      <div className="flex gap-2">
                        {Array.from(new Set(seats.filter(s => s.section === section && s.row === row).map(s => s.seatNumber)))
                          .sort((a, b) => {
                            const numA = parseInt(a.replace(/[^\d]/g, '')) || 0;
                            const numB = parseInt(b.replace(/[^\d]/g, '')) || 0;
                            return numA - numB;
                          })
                          .map(seatNo => {
                            const seat = seats.find(s => s.section === section && s.row === row && s.seatNumber === seatNo);
                            const isSelected = selected.find(s => s._id === seat._id);
                            const isLockedByMe = seat.status === 'LOCKED' && seat.lockedBy === user?._id?.toString();
                            const status = isSelected || isLockedByMe ? 'SELECTED' : seat.status;
                            
                            return (
                              <button
                                key={seat._id}
                                onClick={() => handleSeatClick(seat)}
                                disabled={seat.status !== 'AVAILABLE' && !isLockedByMe}
                                className={`w-8 h-8 rounded-md border text-[10px] font-bold transition-all flex items-center justify-center ${STATUS_COLORS[status]}`}
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

          <div className="mt-12 pt-8 border-t border-gray-50 flex justify-center gap-8 flex-wrap">
            {[
              { label: 'Available', color: 'bg-white border-gray-300' },
              { label: 'Selected', color: 'bg-[#f84464] border-[#f84464]' },
              { label: 'Booked', color: 'bg-gray-200 border-gray-300' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${l.color}`} />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Sidebar */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-xl font-black text-[#333] mb-6 tracking-tight">Booking Summary</h2>
            
            {selected.length > 0 ? (
              <div className="space-y-4 mb-8">
                {selected.map(seat => (
                  <div key={seat._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <div className="text-sm font-bold text-[#333]">Seat {seat.seatNumber}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">{seat.section}</div>
                    </div>
                    <div className="text-sm font-bold text-[#f84464]">₹{seat.price / 100}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-8">
                <p className="text-gray-400 text-sm font-medium px-8">No seats selected. <br/>Tap on the map to pick your spot!</p>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-tight">Total Amount</span>
                <span className="text-3xl font-black text-[#333]">₹{totalPrice / 100}</span>
              </div>
            </div>

            <button
              onClick={handleLock}
              disabled={selected.length === 0 || locking}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
                selected.length === 0 || locking
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#f84464] text-white hover:bg-[#d63955] shadow-[#f84464]/20'
              }`}
            >
              {locking ? 'Securing Seats...' : `Book ${selected.length} Ticket${selected.length !== 1 ? 's' : ''}`}
            </button>
            <p className="text-[10px] text-center text-gray-400 font-medium mt-4">
              Seats are held for 5 minutes after clicking book.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default EventDetail;