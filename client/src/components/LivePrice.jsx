import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function LivePrice({ pricing, basePrice }) {
  if (!pricing) return null;

  const { currentPrice, multiplier } = pricing;
  const isSurge = multiplier > 1.3;
  const priceIncrease = currentPrice - (basePrice || currentPrice);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
      color: '#fff',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 102, 204, 0.3)',
      maxWidth: '400px',
      margin: '0 auto 2rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.875rem', opacity: 0.85, marginBottom: '0.25rem', fontWeight: '500' }}>
            💰 Live Ticket Price
          </p>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            ₹{currentPrice}
          </p>
        </div>
        {isSurge && (
          <div style={{ background: '#ff9500', color: '#fff', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> SURGE
          </div>
        )}
      </div>

      {priceIncrease > 0 && (
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <p style={{ opacity: 0.85, marginBottom: '0.25rem' }}>Base Price: ₹{basePrice}</p>
          <p style={{ opacity: 0.85 }}>Pricing Multiplier: <strong>{multiplier}x</strong></p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.75 }}>
            {isSurge ? '⚡ High demand detected — prices surged' : 'Dynamic pricing applied'}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.75rem', opacity: 0.9 }}>
        <div>
          <p style={{ opacity: 0.7, marginBottom: '0.25rem' }}>Multiplier</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{multiplier}x</p>
        </div>
        <div>
          <p style={{ opacity: 0.7, marginBottom: '0.25rem' }}>Saving Until</p>
          <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>30 seconds</p>
        </div>
      </div>

      {isSurge && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255, 152, 0, 0.2)', borderLeft: '3px solid #ff9800', borderRadius: '4px', fontSize: '0.8rem' }}>
          📢 Prices are changing frequently due to high demand. Book soon!
        </div>
      )}
    </div>
  );
}

  fontSize: "12px",
  color: "#aaa",
};