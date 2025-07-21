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
    <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-[#f28a22] to-[#ff5e62]">
      <form
        onSubmit={handleLogin}
        className="bg-white px-8 py-10 rounded-xl shadow-lg flex flex-col sm:flex-row flex-wrap gap-2 animate-fade-in w-[350px]"
      >
        <h1 className="text-2xl font-bold text-center text-[#333]">Cheetah Admin Login</h1>
        <input
          type="text"
          placeholder="Admin ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="border px-4 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-4 py-2 rounded"
        />
        <button
          type="submit"
          className="cheetah-gradient-btn text-center w-full md:w-auto"
        >
          Log In
        </button>
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
      </form>
    </div>
 </ProtectedRoute>
  );
}
