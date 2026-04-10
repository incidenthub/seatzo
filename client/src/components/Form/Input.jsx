import React from 'react';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, error, required = false, ...props }) => {
  return (
    <div className="form-group" style={{ marginBottom: '1rem' }}>
      {label && (
        <label htmlFor={name} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '4px',
          border: `1px solid ${error ? 'red' : '#ccc'}`,
          fontSize: '1rem',
        }}
        {...props}
      />
      {error && <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
};

export default Input;
