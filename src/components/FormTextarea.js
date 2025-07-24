// src/components/FormTextarea.js
import React from 'react';

const FormTextarea = ({
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
  className = '',
  ...props
}) => {
  const baseClasses = `bg-white/10 border border-white/20 rounded px-3 py-2 transition-all duration-200 focus:border-orange-400/50 focus:outline-none focus:ring-2 focus:ring-orange-400/20 resize-vertical ${className}`;

  // Add asterisk to placeholder if required
  const displayPlaceholder = required && placeholder && !placeholder.includes('*') 
    ? `${placeholder} *` 
    : placeholder;

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={displayPlaceholder}
          rows={rows}
          required={required}
          className={baseClasses}
          {...props}
        />
      </div>
    </div>
  );
};

export default FormTextarea;
