import React from 'react';

const Button = ({ children, type = 'button', onClick, disabled = false, loading = false, variant = 'primary', ...props }) => {
  const getStyles = () => {
    const baseStyles = {
      padding: '0.75rem 1.5rem',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      border: 'none',
      width: '100%',
      transition: 'background-color 0.2s ease',
      opacity: disabled || loading ? 0.7 : 1,
    };

    const variants = {
      primary: {
        backgroundColor: '#3b82f6',
        color: '#fff',
      },
      secondary: {
        backgroundColor: '#94a3b8',
        color: '#fff',
      },
      outline: {
        backgroundColor: 'transparent',
        border: '2px solid #3b82f6',
        color: '#3b82f6',
      },
    };

    return { ...baseStyles, ...variants[variant] };
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={getStyles()}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span className="spinner" style={{
            width: '1rem',
            height: '1rem',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
