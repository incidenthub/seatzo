
import React from 'react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div
      style={{
        padding: '0.75rem',
        backgroundColor: '#fee2e2',
        border: '1px solid #ef4444',
        borderRadius: '4px',
        color: '#b91c1c',
        fontSize: '0.875rem',
        marginBottom: '1rem',
        textAlign: 'center',
      }}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
