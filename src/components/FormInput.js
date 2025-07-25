// src/components/FormInput.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const FormInput = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  icon,
  successIcon,
  errorIcon,
  isValid,
  hasError,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useTheme();
  
  // Dynamic base classes that account for icon presence
  const getBaseClasses = () => {
    const basePadding = icon ? 'pl-10 pr-4' : 'px-4';
    return `${theme.colors.input} ${theme.colors.inputFocus} rounded-lg ${basePadding} py-2 transition-all duration-200 ${className}`;
  };

  // Add asterisk to placeholder if required
  const displayPlaceholder = required && placeholder && !placeholder.includes('*') 
    ? `${placeholder} *` 
    : placeholder;

  // Icon animation variants
  const iconVariants = {
    idle: { scale: 1, rotate: 0 },
    focused: { scale: 1.1, rotate: 5 },
    success: { scale: 1.2, rotate: 0, color: '#10b981' },
    error: { scale: 1.1, rotate: -5, color: '#ef4444' }
  };

  const getIconState = () => {
    if (hasError) return 'error';
    if (isValid) return 'success';
    if (isFocused) return 'focused';
    return 'idle';
  };

  // Get additional padding classes for validation icons
  const getValidationPadding = () => {
    if (isValid || hasError) {
      return icon ? 'pr-10' : 'pr-10';
    }
    return '';
  };

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <motion.div 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 z-10"
            variants={iconVariants}
            animate={getIconState()}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {icon}
          </motion.div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={displayPlaceholder}
          required={required}
          className={`${getBaseClasses()} ${getValidationPadding()} ${hasError ? 'border-red-400/50' : ''}`}
          {...props}
        />
        
        {/* Success/Error icons */}
        <AnimatePresence>
          {isValid && successIcon && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: 10 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400"
              transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 25 }}
            >
              {successIcon}
            </motion.div>
          )}
          
          {hasError && errorIcon && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: 10 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400"
              transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 25 }}
            >
              {errorIcon}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FormInput;
