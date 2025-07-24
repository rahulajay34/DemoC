// src/components/FormSelect.js
import React from 'react';

const FormSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  className = '',
  icon,
  ...props
}) => {
  const baseClasses = `bg-white/10 border border-white/20 rounded px-3 py-2 transition-all duration-200 focus:border-orange-400/50 focus:outline-none focus:ring-2 focus:ring-orange-400/20 text-white ${className}`;

  // Add asterisk to placeholder if required
  const displayPlaceholder = required && !placeholder.includes('*') 
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
        <select
          value={value}
          onChange={onChange}
          required={required}
          className={`${baseClasses} ${icon ? 'pl-10' : ''}`}
          style={{
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}
          {...props}
        >
          <option value="" style={{ color: '#1f2937', backgroundColor: 'white' }}>
            {displayPlaceholder}
          </option>
          {options.map((option, index) => (
            <option 
              key={index} 
              value={option.value} 
              style={{ color: '#1f2937', backgroundColor: 'white' }}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FormSelect;
