import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORY_META } from '../config/constants';

const EventCard = ({ event }) => {
  const { _id, title, date, venue, city, category, posterUrl, basePrice, availableSeats } = event;
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const categoryInfo = CATEGORY_META[category] || { icon: '🎟️', label: category, gradient: '#ccc' };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#fff',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
    }}
    >
      <Link to={`/events/${_id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
          <img 
            src={posterUrl || 'https://via.placeholder.com/400x200?text=Event+Poster'} 
            alt={title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '4px 8px',
            borderRadius: '6px',
            background: categoryInfo.gradient,
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span>{categoryInfo.icon}</span>
            <span>{categoryInfo.label}</span>
          </div>
        </div>

        <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>
          
          <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>
            📅 {formattedDate}
          </div>
          
          <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
            📍 {venue}, {city}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Starting from</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>${basePrice}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '2px 8px', 
                borderRadius: '9999px', 
                backgroundColor: availableSeats > 10 ? '#dcfce7' : '#fee2e2',
                color: availableSeats > 10 ? '#166534' : '#991b1b',
                fontWeight: 'medium'
              }}>
                {availableSeats} seats left
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default EventCard;
