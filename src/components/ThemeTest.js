"use client";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeTest() {
  const { 
    currentTheme, 
    actualTheme, 
    theme, 
    changeTheme, 
    getStatusColor, 
    getCardStyles,
    getButtonStyles,
    getGlassStyles,
    isLoading 
  } = useTheme();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading theme...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className={`${getCardStyles()} p-6 rounded-lg`}>
        <h2 className={`text-2xl font-bold mb-4 ${theme.colors.textPrimary}`}>
          Theme System Test
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${theme.colors.textSecondary}`}>
              Current Theme Info
            </h3>
            <ul className={`space-y-1 ${theme.colors.textMuted}`}>
              <li>Selected: {currentTheme}</li>
              <li>Active: {actualTheme}</li>
              <li>Loading: {isLoading ? "Yes" : "No"}</li>
            </ul>
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${theme.colors.textSecondary}`}>
              Theme Controls
            </h3>
            <div className="space-x-2">
              <button
                onClick={() => changeTheme("light")}
                className={`px-4 py-2 rounded ${getButtonStyles("secondary")}`}
              >
                Light
              </button>
              <button
                onClick={() => changeTheme("dark")}
                className={`px-4 py-2 rounded ${getButtonStyles("secondary")}`}
              >
                Dark
              </button>
              <button
                onClick={() => changeTheme("auto")}
                className={`px-4 py-2 rounded ${getButtonStyles("secondary")}`}
              >
                Auto
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`${getGlassStyles()} p-6 rounded-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme.colors.textPrimary}`}>
          Status Colors Demo
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "success", "warning", "error", "info",
            "pending", "active", "failed", "completed"
          ].map(status => (
            <div key={status} className={`p-3 rounded ${theme.colors.surface}`}>
              <div className={`font-medium ${getStatusColor(status)}`}>
                {status}
              </div>
              <div className={`text-xs mt-1 px-2 py-1 rounded ${theme.colors.successBg}`}>
                Sample badge
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className={`p-4 rounded-lg ${getButtonStyles("primary")}`}>
          Primary Button
        </button>
        <button className={`p-4 rounded-lg ${getButtonStyles("secondary")}`}>
          Secondary Button
        </button>
        <button className={`p-4 rounded-lg ${getButtonStyles("ghost")}`}>
          Ghost Button
        </button>
      </div>
    </div>
  );
}
