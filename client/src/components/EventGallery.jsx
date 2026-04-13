import React from 'react';
import EventCard from './EventCard';

const EventGallery = ({ events, isLoading, error }) => {
  if (isLoading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
        padding: '2rem 0',
      }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ height: '350px', backgroundColor: '#f3f4f6', borderRadius: '12px', animation: 'pulse 1.5s infinite ease-in-out' }}>
            <style>{`
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}</style>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#fee2e2', borderRadius: '12px', color: '#b91c1c' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Oops! Something went wrong.</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            marginTop: '1rem', 
            padding: '0.5rem 1.5rem', 
            backgroundColor: '#b91c1c', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>No events found.</p>
        <p>Check back later for new events!</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '2rem',
      padding: '2rem 0',
    }}>
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
};

export default EventGallery;
