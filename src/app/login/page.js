"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute.js";

export default function LoginPage() {
  const { login } = useAuth();
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
    <ProtectedRoute>
      <div className="w-full min-h-screen flex justify-center items-center">
        <form
          onSubmit={handleLogin}
          className="glass-card p-8 md:p-10 flex flex-col gap-6 animate-fade-in w-full max-w-sm"
        >
          <div className="card-content">
            <h1 className="text-3xl font-bold text-center text-white mb-4">
              Cheetah Admin
            </h1>
            <input
              type="text"
              placeholder="Admin ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            <button
              type="submit"
              className="cheetah-gradient-btn text-center w-full py-3 mt-2"
            >
              Log In
            </button>
            {error && (
              <p className="text-red-400 text-center text-sm mt-4">{error}</p>
            )}
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}