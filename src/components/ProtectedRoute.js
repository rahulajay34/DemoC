"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { authenticated, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !authenticated && pathname !== "/login") {
      router.replace("/login");
    }
  }, [authLoading, authenticated, pathname, router]);

  // While auth status is loading (especially on reload), show nothing or spinner
  if (authLoading) return null;

  // If not authenticated and not on the login page, block access completely
  if (!authenticated && pathname !== "/login") return null;

  // Show children to authenticated users
  return children;
}
