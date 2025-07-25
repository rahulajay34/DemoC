// src/components/FormInput.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  const baseClasses = `bg-white/10 border border-white/20 rounded px-3 py-2 transition-all duration-200 focus:border-orange-400/50 focus:outline-none focus:ring-2 focus:ring-orange-400/20 ${className}`;

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
          className={`${baseClasses} ${icon ? 'pl-10' : ''} ${isValid ? 'pr-10' : ''} ${hasError ? 'pr-10 border-red-400/50' : ''}`}
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
