"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Enhanced color schemes for different themes with better accessibility and visual hierarchy
export const themes = {
  light: {
    name: "light",
    colors: {
      // Background colors with sophisticated elegance and enhanced majestic depth
      primary: "bg-gradient-to-br from-slate-100 via-indigo-50/90 to-violet-50/70", // Richer background with more pronounced gradient
      secondary: "bg-white/95 backdrop-blur-3xl", // Enhanced glass effect with more blur
      tertiary: "bg-slate-50/90", // Improved subtle background
      accent: "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500", // Enhanced vibrant brand accent
      accentSolid: "bg-orange-500", // Solid accent for simple cases
      
      // Text colors with premium contrast and majestic hierarchy - Enhanced for better contrast
      textPrimary: "text-slate-950", // Even deeper, more authoritative text
      textSecondary: "text-slate-800", // Stronger secondary text for better contrast
      textMuted: "text-slate-600", // Enhanced muted text with better visibility
      textInverse: "text-white", // Text on dark backgrounds
      textAccent: "text-orange-700", // Deeper accent text for elegance
      
      // Border colors with refined elegance and majestic depth
      borderPrimary: "border-slate-300/90", // More defined primary borders
      borderSecondary: "border-slate-400/70", // Enhanced secondary borders
      borderAccent: "border-orange-500/80", // Stronger accent borders
      borderMuted: "border-slate-200/80", // Improved muted borders
      
      // Status colors with enhanced vibrancy and better visibility for light mode
      success: "text-emerald-900", // Even deeper for better visibility
      warning: "text-amber-900", // Richer warning color
      error: "text-red-900", // Stronger error indication
      info: "text-blue-900", // Deeper info color
      
      // Background status colors with enhanced contrast and visibility
      successBg: "bg-gradient-to-r from-emerald-200/90 to-teal-200/80 border-emerald-400/90 text-emerald-900",
      warningBg: "bg-gradient-to-r from-amber-200/90 to-orange-200/80 border-amber-400/90 text-amber-900",
      errorBg: "bg-gradient-to-r from-red-200/90 to-rose-200/80 border-red-400/90 text-red-900",
      infoBg: "bg-gradient-to-r from-blue-200/90 to-sky-200/80 border-blue-400/90 text-blue-900",
      
      // Interactive elements with premium feel and majestic sophistication
      buttonPrimary: "bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-orange-500/40 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 backdrop-blur-sm ring-1 ring-orange-500/30",
      buttonSecondary: "bg-white/95 backdrop-blur-2xl hover:bg-white text-slate-900 border-2 border-slate-400/80 hover:border-orange-600/60 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transform hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-slate-300/50",
      buttonGhost: "bg-transparent hover:bg-slate-100/80 backdrop-blur-sm text-slate-800 hover:text-slate-900 border border-transparent hover:border-slate-400/60 hover:shadow-lg transition-all duration-300",
      buttonDanger: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-2xl hover:shadow-red-500/40 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 ring-1 ring-red-500/30",
      buttonSuccess: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-2xl hover:shadow-emerald-500/40 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 ring-1 ring-emerald-500/30",
      
      // Form elements with premium glassmorphism and majestic elegance
      input: "bg-white/85 backdrop-blur-2xl border-slate-400/70 text-slate-900 placeholder-slate-500 shadow-xl ring-1 ring-slate-300/50",
      inputFocus: "focus:border-orange-600/80 focus:ring-4 focus:ring-orange-500/20 focus:outline-none focus:bg-white/95 focus:shadow-2xl focus:shadow-orange-500/10",
      inputError: "border-red-500/80 focus:border-red-600/80 focus:ring-4 focus:ring-red-500/20 focus:bg-red-50/80 ring-1 ring-red-300/50",
      
      // Sidebar and navigation with premium glassmorphism and enhanced depth
      sidebarBg: "bg-white/95 backdrop-blur-3xl border-r border-slate-300/90 shadow-2xl shadow-slate-900/12",
      sidebarText: "text-slate-800", // Deeper text for better contrast
      sidebarActive: "bg-gradient-to-r from-orange-500/25 via-red-500/20 to-pink-500/15 text-orange-800 border-r-4 border-orange-700/90 shadow-xl shadow-orange-500/20 backdrop-blur-xl font-semibold",
      sidebarHover: "hover:bg-slate-100/80 hover:text-slate-900 hover:shadow-lg transition-all duration-300 backdrop-blur-sm",
      
      // Cards and panels with premium glassmorphism effects and majestic presence
      cardBg: "bg-white/85 backdrop-blur-3xl",
      cardShadow: "shadow-2xl shadow-slate-900/12 hover:shadow-3xl hover:shadow-slate-900/16 transition-all duration-500",
      cardBorder: "border border-slate-300/60 ring-1 ring-slate-200/80",
      cardHover: "hover:shadow-2xl hover:shadow-orange-500/15 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white/95 transition-all duration-500 hover:border-orange-500/30",
      
      // Enhanced glass effect optimized for light theme majestic elegance
      glass: "bg-white/80 backdrop-blur-3xl border-slate-300/50 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-300/60",
      glassBorder: "border border-slate-300/70 ring-1 ring-slate-200/50",
      
      // Additional utility colors with premium majestic feel
      divider: "border-slate-300/80",
      overlay: "bg-slate-900/30 backdrop-blur-sm",
      surface: "bg-slate-100/90 backdrop-blur-sm",
      surfaceHover: "hover:bg-white/80 hover:backdrop-blur-lg hover:shadow-xl",
    }
  },
  dark: {
    name: "dark",
    colors: {
      // Background colors with rich depth
      primary: "bg-slate-950", // Deep background
      secondary: "bg-slate-900/80", // Card background with transparency
      tertiary: "bg-slate-800/40", // Subtle background
      accent: "bg-gradient-to-r from-orange-500 to-red-500", // Enhanced brand accent
      accentSolid: "bg-orange-500", // Solid accent for simple cases
      
      // Text colors with excellent contrast
      textPrimary: "text-slate-100", // Softer white for better readability
      textSecondary: "text-slate-300", // Secondary text
      textMuted: "text-slate-400", // Muted text
      textInverse: "text-slate-900", // Text on light backgrounds
      textAccent: "text-orange-400", // Accent text color
      
      // Border colors with subtle glow effects
      borderPrimary: "border-slate-700/60",
      borderSecondary: "border-slate-600/40",
      borderAccent: "border-orange-500/80",
      borderMuted: "border-slate-800/50",
      
      // Status colors with enhanced visibility in dark mode
      success: "text-emerald-400",
      warning: "text-amber-400",
      error: "text-red-400",
      info: "text-sky-400",
      
      // Background status colors with neon-like glow
      successBg: "bg-emerald-500/10 border-emerald-500/30",
      warningBg: "bg-amber-500/10 border-amber-500/30",
      errorBg: "bg-red-500/10 border-red-500/30",
      infoBg: "bg-sky-500/10 border-sky-500/30",
      
      // Interactive elements with modern hover effects
      buttonPrimary: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-0.5 transition-all duration-200",
      buttonSecondary: "bg-slate-700/80 hover:bg-slate-600/90 text-slate-100 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-200",
      buttonGhost: "bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 border border-transparent hover:border-slate-600/50 transition-all duration-200",
      buttonDanger: "bg-red-500 hover:bg-red-400 text-white shadow-2xl hover:shadow-red-500/25 transform hover:-translate-y-0.5 transition-all duration-200",
      buttonSuccess: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl hover:shadow-emerald-500/25 transform hover:-translate-y-0.5 transition-all duration-200",
      
      // Form elements with enhanced dark mode styling
      input: "bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 shadow-inner",
      inputFocus: "focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 focus:outline-none focus:bg-slate-800/80",
      inputError: "border-red-500/80 focus:border-red-400 focus:ring-2 focus:ring-red-500/20",
      
      // Sidebar and navigation with glass morphism
      sidebarBg: "bg-slate-950/90 backdrop-blur-xl border-r border-slate-800/60",
      sidebarText: "text-slate-300",
      sidebarActive: "bg-gradient-to-r from-orange-500/20 to-red-500/10 text-orange-400 border-r-2 border-orange-500/80 shadow-lg shadow-orange-500/10",
      sidebarHover: "hover:bg-slate-800/40 hover:text-slate-100 transition-all duration-200",
      
      // Cards and panels with glassmorphism effects
      cardBg: "bg-slate-900/40 backdrop-blur-xl",
      cardShadow: "shadow-2xl shadow-slate-900/50 hover:shadow-3xl transition-shadow duration-300",
      cardBorder: "border border-slate-700/40",
      cardHover: "hover:shadow-2xl hover:shadow-slate-900/60 hover:-translate-y-1 hover:bg-slate-900/60 transition-all duration-300",
      
      // Glass effect optimized for dark theme
      glass: "bg-slate-900/30 backdrop-blur-2xl border-slate-700/30 shadow-2xl",
      glassBorder: "border border-slate-700/20",
      
      // Additional utility colors
      divider: "border-slate-700/50",
      overlay: "bg-slate-950/80",
      surface: "bg-slate-900/60",
      surfaceHover: "hover:bg-slate-800/70",
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(true);
  const [systemTheme, setSystemTheme] = useState("dark");

  // Detect system theme preference
  const detectSystemTheme = () => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("cheetah-theme");
    const detectedSystemTheme = detectSystemTheme();
    setSystemTheme(detectedSystemTheme);
    
    if (savedTheme === "auto" || (!savedTheme && savedTheme !== null)) {
      setCurrentTheme("auto");
    } else if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    } else {
      // Default to system preference if no saved theme
      setCurrentTheme(detectedSystemTheme);
    }
    setIsLoading(false);
  }, []);

  // Apply theme to document when theme changes
  useEffect(() => {
    if (!isLoading && typeof window !== "undefined") {
      const actualTheme = getActualTheme();
      
      // Remove all theme classes
      document.documentElement.classList.remove("light", "dark");
      
      // Add current theme class
      document.documentElement.classList.add(actualTheme);
      
      // Update data-theme attribute for CSS selectors
      document.documentElement.setAttribute("data-theme", actualTheme);
      
      // Save to localStorage
      localStorage.setItem("cheetah-theme", currentTheme);
      
      // Dispatch custom event for theme change
      window.dispatchEvent(new CustomEvent("themeChanged", { 
        detail: { theme: actualTheme, mode: currentTheme } 
      }));
    }
  }, [currentTheme, isLoading]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? "dark" : "light";
      setSystemTheme(newSystemTheme);
      
      // If current theme is auto, update the applied theme
      if (currentTheme === "auto") {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(newSystemTheme);
        document.documentElement.setAttribute("data-theme", newSystemTheme);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent("themeChanged", { 
          detail: { theme: newSystemTheme, mode: "auto" } 
        }));
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themeName === "auto" || themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const getActualTheme = () => {
    if (currentTheme === "auto") {
      return systemTheme;
    }
    return currentTheme;
  };

  const theme = themes[getActualTheme()] || themes.dark;

  const value = {
    currentTheme,
    systemTheme,
    actualTheme: getActualTheme(),
    theme,
    themes,
    changeTheme,
    isLoading,
    
    // Enhanced helper functions
    getThemeClasses: (lightClass, darkClass) => {
      return getActualTheme() === "light" ? lightClass : darkClass;
    },
    
    // Get status color with enhanced color mapping
    getStatusColor: (status) => {
      const statusMap = {
        // Success states
        success: theme.colors.success,
        paid: theme.colors.success,
        active: theme.colors.success,
        available: theme.colors.success,
        completed: theme.colors.success,
        approved: theme.colors.success,
        verified: theme.colors.success,
        online: theme.colors.success,
        
        // Warning states
        warning: theme.colors.warning,
        pending: theme.colors.warning,
        assigned: theme.colors.warning,
        "in-progress": theme.colors.warning,
        reviewing: theme.colors.warning,
        processing: theme.colors.warning,
        waiting: theme.colors.warning,
        
        // Error states
        error: theme.colors.error,
        failed: theme.colors.error,
        overdue: theme.colors.error,
        maintenance: theme.colors.error,
        urgent: theme.colors.error,
        rejected: theme.colors.error,
        cancelled: theme.colors.error,
        offline: theme.colors.error,
        
        // Info states
        info: theme.colors.info,
        idle: theme.colors.info,
        scheduled: theme.colors.info,
        draft: theme.colors.info,
        new: theme.colors.info,
      };
      
      return statusMap[status] || theme.colors.textMuted;
    },
    
    // Get status background color with enhanced mapping
    getStatusBg: (status) => {
      const statusBgMap = {
        // Success states
        success: theme.colors.successBg,
        paid: theme.colors.successBg,
        active: theme.colors.successBg,
        available: theme.colors.successBg,
        completed: theme.colors.successBg,
        approved: theme.colors.successBg,
        verified: theme.colors.successBg,
        online: theme.colors.successBg,
        
        // Warning states
        warning: theme.colors.warningBg,
        pending: theme.colors.warningBg,
        assigned: theme.colors.warningBg,
        "in-progress": theme.colors.warningBg,
        reviewing: theme.colors.warningBg,
        processing: theme.colors.warningBg,
        waiting: theme.colors.warningBg,
        
        // Error states
        error: theme.colors.errorBg,
        failed: theme.colors.errorBg,
        overdue: theme.colors.errorBg,
        maintenance: theme.colors.errorBg,
        urgent: theme.colors.errorBg,
        rejected: theme.colors.errorBg,
        cancelled: theme.colors.errorBg,
        offline: theme.colors.errorBg,
        
        // Info states
        info: theme.colors.infoBg,
        idle: theme.colors.infoBg,
        scheduled: theme.colors.infoBg,
        draft: theme.colors.infoBg,
        new: theme.colors.infoBg,
      };
      
      return statusBgMap[status] || theme.colors.tertiary;
    },
    
    // New utility functions for enhanced theme support
    getCardStyles: () => {
      return `${theme.colors.cardBg} ${theme.colors.cardBorder} ${theme.colors.cardShadow}`;
    },
    
    getGlassStyles: () => {
      return `${theme.colors.glass} ${theme.colors.glassBorder}`;
    },
    
    getButtonStyles: (variant = "primary") => {
      const buttonMap = {
        primary: theme.colors.buttonPrimary,
        secondary: theme.colors.buttonSecondary,
        ghost: theme.colors.buttonGhost,
        danger: theme.colors.buttonDanger,
        success: theme.colors.buttonSuccess,
      };
      return buttonMap[variant] || theme.colors.buttonPrimary;
    },
    
    getInputStyles: (hasError = false) => {
      const baseStyles = `${theme.colors.input} ${hasError ? theme.colors.inputError : theme.colors.inputFocus}`;
      return baseStyles;
    },
    
    // Theme transition utilities
    withTransition: (baseClasses) => {
      return `${baseClasses} transition-all duration-300 ease-in-out`;
    },
    
    // Responsive text utilities
    getResponsiveText: (size = "base") => {
      const sizeMap = {
        xs: "text-xs sm:text-sm",
        sm: "text-sm sm:text-base",
        base: "text-base sm:text-lg",
        lg: "text-lg sm:text-xl",
        xl: "text-xl sm:text-2xl",
        "2xl": "text-2xl sm:text-3xl",
      };
      return sizeMap[size] || sizeMap.base;
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
