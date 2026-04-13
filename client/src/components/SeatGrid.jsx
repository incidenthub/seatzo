import { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import seatService from "../services/seat.service";

export default function SeatGrid({ eventId, seats = [], refresh, onSelectionChange, onCheckout }) {
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
      // Deselect — release the lock
      try {
        await seatService.releaseSeats(eventId, [seat.seatNumber]);
      } catch (err) {
        console.warn('Failed to release seat lock (may have expired):', err);
      }
      setSelectedSeats(prev => prev.filter(s => s._id !== seat._id));
      setMessage('Seat deselected');
      setTimeout(() => setMessage(''), 2000);
      await refresh?.();
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
      await seatService.lockSeats(eventId, [seat.seatNumber]);

      setSelectedSeats(prev => [...prev, { ...seat, status: 'LOCKED' }]);
      setMessage('✅ Seat locked for 5 minutes');
      setTimeout(() => setMessage(''), 2000);
      await refresh?.();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to lock seat';
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

  const total = selectedSeats.reduce((sum, s) => sum + (s.currentPrice || s.price || 0), 0);

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
                  key={seat._id || seat.seatNumber}
                  onClick={() => handleSeatClick(seat)}
                  title={`${seat.seatNumber} - ${getSeatStatus(seat)} - ₹${seat.currentPrice || seat.price || 0}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    background: getSeatColor(seat),
                    border: selectedSeats.find(s => s._id === seat._id) ? '2px solid #0066cc' : '1px solid #d1d5db',
                    cursor: seat.status === 'AVAILABLE' || selectedSeats.find(s => s._id === seat._id) ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '0.75rem',
                    color: selectedSeats.find(s => s._id === seat._id) || seat.status === 'BOOKED' ? '#fff' : '#374151',
                    transition: 'transform 0.2s, background 0.2s',
                    opacity: seat.status === 'BOOKED' || seat.status === 'DISABLED' ? 0.6 : 1,
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
        <div style={{ marginTop: '2rem', background: '#0066cc', color: '#fff', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Selected Seats</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {selectedSeats.map(s => s.seatNumber).join(', ')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                {selectedSeats.length} × ₹{selectedSeats[0]?.currentPrice || selectedSeats[0]?.price || 0}
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{total}</p>
            </div>
            {onCheckout && (
              <button
                onClick={() => onCheckout(selectedSeats, total)}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#fff',
                  color: '#0066cc',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Proceed to Checkout →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
