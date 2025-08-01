"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import CheetahLogo from "../../components/CheetahLogo"; // Import the new component

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, getThemeClasses } = useTheme();
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const success = login({ id, password });
    if (success) {
      router.push("/");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left Side: Brand Section */}
      <div className="w-full md:w-1/2 h-48 md:h-auto flex items-center justify-center bg-cheetah-gradient p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          <CheetahLogo className="w-[355px] h-[90px] text-white drop-shadow-lg" />
          <p className={`${getThemeClasses("text-white/90", "text-white/80")} text-center text-lg font-medium`}>
            Admin Dashboard
          </p>
        </motion.div>
      </div>

      {/* Right Side: Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleLogin}
          className="glass-card p-8 md:p-10 flex flex-col gap-6 w-full max-w-sm"
        >
          <div className="card-content">
            <h2 className={`text-3xl font-bold text-center ${theme.colors.textPrimary} mb-4`}>
              Admin Login
            </h2>
            <input
              type="text"
              placeholder="Admin ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className={`w-full ${theme.colors.input} ${theme.colors.inputFocus} rounded-lg px-4 py-2 placeholder:font-medium transition-all duration-300`}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full ${theme.colors.input} ${theme.colors.inputFocus} rounded-lg px-4 py-2 placeholder:font-medium transition-all duration-300`}
            />
            <button
              type="submit"
              className="cheetah-gradient-btn text-center w-full py-3 mt-2 text-lg font-semibold"
            >
              Log In
            </button>
            {error && (
              <p className={`${getThemeClasses("text-red-600", "text-red-400")} text-center text-sm mt-4 font-medium`}>{error}</p>
            )}
          </div>
        </motion.form>
      </div>
    </div>
  );
}