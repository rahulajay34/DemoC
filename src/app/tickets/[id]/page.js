"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ChatUI from "@/components/ChatUI";
import { useToast } from "@/context/ToastContext";
import { ClipLoader } from "react-spinners";

export default function TicketPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const fetchTicket = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/tickets/${id}`);
          if (!res.ok) throw new Error("Failed to fetch ticket");
          const data = await res.json();
          setTicket(data);
        } catch (error) {
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchTicket();
    }
    // FIX: Removed `toast` from the dependency array.
    // The `id` is the only value that should trigger a re-fetch.
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <ClipLoader color="#f28a22" size={50} />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Ticket not found</h2>
      </div>
    );
  }

  return (
    <section className="flex flex-col h-full">
      <ChatUI ticket={ticket} />
    </section>
  );
}