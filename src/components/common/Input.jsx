// src/components/common/Input.jsx
import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  type = 'text',
  error,
  className = '',
  id,
  fullWidth = true,
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-white font-medium mb-2"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`w-full px-4 py-2 bg-white/10 border rounded-lg text-white 
                   placeholder-white/60 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 
                   transition-all duration-200 outline-none
                   ${error ? 'border-red-500' : 'border-white/30'}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;