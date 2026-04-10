import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle } from "lucide-react";

const API = "http://localhost:5000/api/seats";

export default function SeatGrid({ eventId, seats = [], refresh, onSelectionChange }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [message, setMessage] = useState('');
  const isProcessing = useRef(false);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedSeats);
    }
  }, [selectedSeats]);

  const handleSeatClick = async (seat) => {
    if (isProcessing.current) return;
    
    const isSelected = selectedSeats.find((s) => s._id === seat._id);
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s._id !== seat._id));
      setMessage('Seat deselected');
      return;
    }

    if (seat.status !== 'AVAILABLE') {
      setMessage('❌ This seat is not available');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (selectedSeats.length >= 6) {
      setMessage('❌ Maximum 6 seats can be selected');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    isProcessing.current = true;
    try {
      const response = await axios.post(`${API}/lock`, {
        eventId,
        seatIds: [seat._id],
      });

      setSelectedSeats(prev => [...prev, { ...seat, status: 'LOCKED' }]);
      setMessage('✅ Seat locked for 5 minutes');
      setTimeout(() => setMessage(''), 2000);
      await refresh?.();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to lock seat';
      setMessage('❌ ' + errorMsg);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      isProcessing.current = false;
    }
  };

  const getSeatColor = (seat) => {
    if (selectedSeats.find(s => s._id === seat._id)) return '#0066cc';
    if (seat.status === 'AVAILABLE') return '#e5e7eb';
    if (seat.status === 'LOCKED') return '#fbbf24';
    if (seat.status === 'BOOKED') return '#6b7280';
    return '#d1d5db';
  };

  const getSeatStatus = (seat) => {
    if (selectedSeats.find(s => s._id === seat._id)) return 'Selected';
    return seat.status;
  };

  // Group seats by row
  const seatsByRow = {};
  seats.forEach(seat => {
    if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
    seatsByRow[seat.row].push(seat);
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center', color: '#111827' }}>
        🎭 Select Your Seats (Max 6)
      </h2>

      {/* Message */}
      {message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', background: message.includes('❌') ? '#fee2e2' : '#dcfce7', color: message.includes('❌') ? '#c00' : '#166534', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {message.includes('❌') ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {message}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '24px', height: '24px', background: '#e5e7eb', borderRadius: '4px' }} />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '24px', height: '24px', background: '#fbbf24', borderRadius: '4px' }} />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Locked (5 min)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '24px', height: '24px', background: '#6b7280', borderRadius: '4px' }} />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Booked</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '24px', height: '24px', background: '#0066cc', borderRadius: '4px' }} />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Selected</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        {/* Screen */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '0.875rem', color: '#9ca3af', fontWeight: '600' }}>
          🎬 SCREEN
        </div>

        {/* Seats */}
        {Object.keys(seatsByRow).sort().map(row => (
          <div key={row} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '30px', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textAlign: 'center' }}>
              {row}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${seatsByRow[row].length}, 1fr)`, gap: '0.75rem' }}>
              {seatsByRow[row].map(seat => (
                <button
                  key={seat._id}
                  onClick={() => handleSeatClick(seat)}
                  title={`${seat.seatNumber} - ${getSeatStatus(seat)}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    background: getSeatColor(seat),
                    border: selectedSeats.find(s => s._id === seat._id) ? '2px solid #0066cc' : '1px solid #d1d5db',
                    cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '0.75rem',
                    color: selectedSeats.find(s => s._id === seat._id) || seat.status === 'BOOKED' ? '#fff' : '#374151',
                    transition: 'transform 0.2s, background 0.2s',
                    opacity: seat.status === 'BOOKED' ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (seat.status === 'AVAILABLE') {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.background = '#d1d5db';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.background = getSeatColor(seat);
                  }}
                  disabled={seat.status !== 'AVAILABLE' && !selectedSeats.find(s => s._id === seat._id)}
                >
                  {seat.seatNumber}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {selectedSeats.length > 0 && (
        <div style={{ marginTop: '2rem', background: '#0066cc', color: '#fff', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Selected Seats</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {selectedSeats.map(s => s.seatNumber).join(', ')}
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            {selectedSeats.length} x ₹{selectedSeats[0]?.price || 0} = ₹{selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0)}
          </p>
        </div>
      )}
    </div>
  );
}

      isProcessing.current = false;
    }
  };

  const total = selectedSeats.reduce(
    (sum, s) => sum + (s.currentPrice || 0),
    0
  );

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
      <div className="text-center mb-16">
        <div className="inline-block px-8 py-3 bg-slate-900 text-white rounded-full font-display font-bold text-xs tracking-widest uppercase mb-4">
          STAGE / SCREEN
        </div>
        <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-50" />
      </div>

      <div className="flex justify-center mb-16 overflow-x-auto pb-4">
        <div className="grid grid-cols-10 gap-4 min-w-[500px]">
          {seats.map((seat) => {
            const isSelected = selectedSeats.find(
              (s) => s.seatNumber === seat.seatNumber
            );

            return (
              <motion.div
                key={seat.seatNumber}
                whileHover={{ scale: seat.status === "available" ? 1.2 : 1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer font-bold text-xs transition-all duration-300 shadow-sm
                  ${seat.status === "available" ? "bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white" : ""}
                  ${seat.status === "locked" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""}
                  ${seat.status === "booked" ? "bg-slate-200 text-slate-500 cursor-not-allowed" : ""}
                  ${isSelected ? "bg-primary-600 text-white ring-4 ring-primary-100 scale-110 shadow-lg" : ""}
                `}
                onClick={() => handleSeatClick(seat)}
              >
                {seat.seatNumber}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-8 border-t border-slate-100 pt-10">
        <Legend color="bg-primary-50 text-primary-600" label="Available" />
        <Legend color="bg-primary-600 text-white" label="Selected" />
        <Legend color="bg-slate-100 text-slate-400" label="Reserved" />
        <Legend color="bg-slate-200 text-slate-500" label="Sold" />
      </div>

      {selectedSeats.length > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 glass-card p-6 rounded-3xl flex items-center justify-between border-primary-100"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total to Pay</p>
            <p className="text-3xl font-extrabold text-slate-900">${total.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Seats Selected</p>
              <p className="font-bold text-primary-600">{selectedSeats.length} Tickets</p>
            </div>
            <button className="btn-primary px-8 py-4">Checkout</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

const Legend = ({ color, label }) => (
  <div className="flex items-center gap-3">
    <div className={`w-4 h-4 rounded-md shadow-sm ${color.split(' ')[0]}`} />
    <span className="text-sm font-bold text-slate-600">{label}</span>
  </div>
);
