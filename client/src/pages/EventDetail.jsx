import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SECTION_COLORS = {
  PREMIUM: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
  GOLD: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
  SILVER: 'bg-zinc-500/20 border-zinc-400/50 text-zinc-300',
  GENERAL: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
};

const STATUS_COLORS = {
  AVAILABLE: 'bg-zinc-700 hover:bg-violet-600 border-zinc-600 cursor-pointer text-white',
  LOCKED: 'bg-yellow-900/50 border-yellow-700 cursor-not-allowed text-yellow-500',
  BOOKED: 'bg-red-900/50 border-red-800 cursor-not-allowed text-red-500',
  DISABLED: 'bg-zinc-900 border-zinc-800 cursor-not-allowed text-zinc-700',
  SELECTED: 'bg-violet-600 border-violet-400 cursor-pointer text-white ring-2 ring-violet-400',
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
  const timerRef = useRef(null);

  const fetchEvent = async () => {
    const res = await api.get(`/events/${id}`);
    setEvent(res.data.event);
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
    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, [id]);

  const handleSeatClick = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    if (selected.find((s) => s.seatNumber === seat.seatNumber)) {
      setSelected(selected.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selected.length >= 6) { toast.error('Max 6 seats per booking'); return; }
      setSelected([...selected, seat]);
    }
  };

  const handleLock = async () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    if (selected.length === 0) { toast.error('Select at least one seat'); return; }

    setLocking(true);
    try {
      await api.post('/seats/lock', {
        eventId: id,
        seatIds: selected.map((s) => s.seatNumber),
      });

      toast.success('Seats locked for 5 minutes!');

      let secs = 300;
      timerRef.current = setInterval(() => {
        secs--;
        if (secs <= 0) {
          clearInterval(timerRef.current);
          setSelected([]);
          toast.error('Lock expired. Please re-select your seats.');
        }
      }, 1000);

      navigate('/checkout', {
        state: {
          eventId: id,
          event,
          selectedSeats: selected,
          pricing,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not lock seats');
    } finally {
      setLocking(false);
    }
  };

  const formatPrice = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const grouped = seats.reduce((acc, seat) => {
    const key = seat.section;
    if (!acc[key]) acc[key] = {};
    if (!acc[key][seat.row]) acc[key][seat.row] = [];
    acc[key][seat.row].push(seat);
    return acc;
  }, {});

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
      Event not found
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Event header */}
      <div className="bg-gradient-to-b from-violet-950/40 to-zinc-950 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs bg-violet-900/50 text-violet-300 px-3 py-1 rounded-full capitalize">
            {event.category}
          </span>
          <h1 className="text-3xl font-bold mt-3 mb-2">{event.title}</h1>
          <p className="text-zinc-400 text-sm">{event.venue} · {event.city}</p>
          <p className="text-zinc-500 text-sm mt-1">{formatDate(event.date)}</p>

          {pricing && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-bold text-violet-400">
                {formatPrice(pricing.price)}
              </span>
              {pricing.multiplier > 1 && (
                <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded-md">
                  {pricing.multiplier.toFixed(1)}× surge
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-8 text-xs">
          {[
            { label: 'Available', color: 'bg-zinc-700' },
            { label: 'Selected', color: 'bg-violet-600' },
            { label: 'Locked', color: 'bg-yellow-900' },
            { label: 'Booked', color: 'bg-red-900' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${color}`} />
              <span className="text-zinc-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Stage indicator */}
        <div className="bg-zinc-800 text-zinc-400 text-xs text-center py-2 rounded-lg mb-8 tracking-widest uppercase">
          Stage / Screen
        </div>

        {/* Seat map */}
        <div className="space-y-8">
          {Object.entries(grouped).map(([section, rows]) => (
            <div key={section}>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-medium mb-4 ${SECTION_COLORS[section] || 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}>
                {section}
              </div>

              <div className="space-y-2">
                {Object.entries(rows).map(([row, rowSeats]) => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="text-zinc-600 text-xs w-5 text-right">{row}</span>
                    <div className="flex gap-1 flex-wrap">
                      {rowSeats.map((seat) => {
                        const isSelected = selected.find((s) => s.seatNumber === seat.seatNumber);
                        const statusKey = isSelected ? 'SELECTED' : seat.status;
                        return (
                          <button
                            key={seat.seatNumber}
                            onClick={() => handleSeatClick(seat)}
                            title={`${seat.seatNumber} — ${formatPrice(seat.price)}`}
                            className={`w-8 h-8 rounded text-xs border transition-all ${STATUS_COLORS[statusKey]}`}
                          >
                            {seat.seatNumber.replace(row, '')}
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

        {/* Booking bar */}
        {selected.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-medium">
                  {selected.length} seat{selected.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-zinc-400 text-sm">
                  {selected.map((s) => s.seatNumber).join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-violet-400 font-bold text-lg">
                  {pricing ? formatPrice(pricing.price * selected.length) : '—'}
                </span>
                <button
                  onClick={handleLock}
                  disabled={locking}
                  className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
                >
                  {locking ? 'Locking...' : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;