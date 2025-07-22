"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import SkeletonCardGrid from "@/components/SkeletonCardGrid";
import Image from "next/image";
import scooty from "../../public/scooty.gif";
import { motion } from "framer-motion";
import Link from "next/link";

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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <ProtectedRoute>
      <section>
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

        {loading ? (
          <SkeletonCardGrid count={3} />
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            {["riders", "bikes", "assignments"].map((type) => (
              <Link href={`/${type}`} key={type} className="group">
                <motion.div
                  className="glass-card h-48 flex items-center justify-center" // Set a fixed height and center content
                  variants={cardVariants}
                  whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                >
                  <div className="card-content text-center">
                    {/* ✨ Default State Content - Fades out on hover ✨ */}
                    <div className="transition-opacity duration-300 group-hover:opacity-0">
                      <div className="text-6xl font-extrabold text-white drop-shadow-lg">
                        {counts[type]}
                      </div>
                      <div className="mt-2 text-lg text-white/80 font-medium capitalize">
                        {type}
                      </div>
                    </div>

                    {/* ✨ Hover State Content - Fades in on hover ✨ */}
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                      <p className="text-white text-2xl font-bold">View {type}</p>
                    </div>

                    {/* Scooty animation remains in the background */}
                    {type === "riders" && (
                      <div className="absolute bottom-3 right-3 opacity-50 group-hover:opacity-80 transition-opacity duration-300 animate-scooty-glide">
                        <Image
                          src={scooty}
                          alt="Scooty"
                          width={40}
                          height={40}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </section>
    </ProtectedRoute>
  );
}