"use client";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

const typeStyles = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  warning: "bg-yellow-500 text-black",
};

export default function Toast() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className={`text-white px-4 py-2 rounded-xl shadow-lg w-64 font-medium ${typeStyles[toast.type]} shadow`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
