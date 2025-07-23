"use client";
import { useState, useEffect } from "react";
import TicketForm from "@/components/TicketForm";
import TicketList from "@/components/TicketList";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function TicketingPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const addTicket = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  return (
    <section className="animate-fade-in glass-card p-6 md:p-8">
      <div className="card-content">
        <h2 className="text-2xl font-bold mb-6">Ticketing</h2>
        <TicketForm addTicket={addTicket} />
        {loading ? (
          <SkeletonTable columns={4} rows={5} />
        ) : (
          <TicketList tickets={tickets} />
        )}
      </div>
    </section>
  );
}