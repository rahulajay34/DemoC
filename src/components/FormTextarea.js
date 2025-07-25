// src/components/FormTextarea.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const FormTextarea = ({
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
  className = '',
  icon,
  ...props
}) => {
  const { theme } = useTheme();
  
  // Dynamic base classes that account for icon presence
  const getBaseClasses = () => {
    const basePadding = icon ? 'pl-10 pr-4' : 'px-4';
    return `${theme.colors.input} ${theme.colors.inputFocus} rounded-lg ${basePadding} py-2 transition-all duration-200 resize-vertical ${className}`;
  };

  // Add asterisk to placeholder if required
  const displayPlaceholder = required && placeholder && !placeholder.includes('*') 
    ? `${placeholder} *` 
    : placeholder;

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-white/60 z-10">
            {icon}
          </div>
        )}
        <textarea
          value={value}
          onChange={onChange}
          placeholder={displayPlaceholder}
          rows={rows}
          required={required}
          className={getBaseClasses()}
          {...props}
        />
      </div>
    </div>
  );
};

export default FormTextarea;
