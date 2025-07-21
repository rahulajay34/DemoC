"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import SkeletonCardGrid from "@/components/SkeletonCardGrid";

export default function Dashboard() {
  const [counts, setCounts] = useState({ riders: 0, bikes: 0, assignments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [r, b, a] = await Promise.all([
          fetch("/api/riders").then((res) => res.json()),
          fetch("/api/bikes").then((res) => res.json()),
          fetch("/api/assignments").then((res) => res.json()),
        ]);
        setCounts({
          riders: r.length,
          bikes: b.length,
          assignments: a.length,
        });
      } catch (err) {
        console.error("Error loading dashboard counts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  return (
    <ProtectedRoute>
      <section>
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

        {loading ? (
          <SkeletonCardGrid count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {["riders", "bikes", "assignments"].map((type) => (
              <div
                key={type}
                className="rounded-2xl p-8 bg-cheetah-gradient shadow-cheetah flex flex-col items-center animate-slide-up"
              >
                <div className="text-5xl font-extrabold text-white drop-shadow-lg">
                  {counts[type]}
                </div>
                <div className="mt-2 text-lg text-white font-medium capitalize">
                  {type}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </ProtectedRoute>
  );
}
