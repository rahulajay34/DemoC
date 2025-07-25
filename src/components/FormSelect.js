// src/components/FormSelect.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  
  // Dynamic base classes that account for icon presence
  const getBaseClasses = () => {
    const basePadding = icon ? 'pl-10 pr-4' : 'px-4';
    return `${theme.colors.input} ${theme.colors.inputFocus} rounded-lg ${basePadding} py-2 transition-all duration-200 ${className}`;
  };

  // Add asterisk to placeholder if required
  const displayPlaceholder = required && !placeholder.includes('*') 
    ? `${placeholder} *` 
    : placeholder;

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 z-10">
            {icon}
          </div>
        )}
        <select
          value={value}
          onChange={onChange}
          required={required}
          className={getBaseClasses()}
          {...props}
        >
          <option value="">
            {displayPlaceholder}
          </option>
          {options.map((option, index) => (
            <option 
              key={index} 
              value={option.value}
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
