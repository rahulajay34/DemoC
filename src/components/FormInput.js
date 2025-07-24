// src/components/FormInput.js
import React from 'react';

const FormInput = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  icon,
  ...props
}) => {
  const baseClasses = `bg-white/10 border border-white/20 rounded px-3 py-2 transition-all duration-200 focus:border-orange-400/50 focus:outline-none focus:ring-2 focus:ring-orange-400/20 ${className}`;

  // Add asterisk to placeholder if required
  const displayPlaceholder = required && placeholder && !placeholder.includes('*') 
    ? `${placeholder} *` 
    : placeholder;

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={displayPlaceholder}
          required={required}
          className={`${baseClasses} ${icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default FormInput;
