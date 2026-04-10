import React from 'react';

const LoadingSpinner = ({ fullPage = false }) => {
  const spinnerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: fullPage ? '100vh' : '200px',
    flexDirection: 'column',
    gap: '1rem',
  };

  const ringStyle = {
    width: '3rem',
    height: '3rem',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={spinnerStyle}>
      <div style={ringStyle}></div>
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading, please wait...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
