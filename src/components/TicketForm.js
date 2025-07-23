"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export default function TicketForm({ addTicket }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rider, setRider] = useState("");
  const [riders, setRiders] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch all riders for the dropdown
    const fetchRiders = async () => {
      try {
        const res = await fetch("/api/riders");
        if (!res.ok) throw new Error("Failed to fetch riders");
        const data = await res.json();
        setRiders(data);
      } catch (error) {
        toast.error("Failed to load riders");
      }
    };
    fetchRiders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rider) {
      toast.error("Please select a rider");
      return;
    }
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, rider }),
      });
      if (!res.ok) throw new Error("Failed to create ticket");
      const newTicket = await res.json();
      addTicket(newTicket);
      setTitle("");
      setDescription("");
      setRider("");
      toast.success("Ticket created successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full p-4 flex flex-col gap-4 bg-black/10 rounded-2xl mb-6"
    >
      <select
        value={rider}
        onChange={(e) => setRider(e.target.value)}
        className="bg-white/10 border border-white/20 rounded px-3 py-2 w-full"
        required
      >
        <option value="" disabled>
          Select Rider
        </option>
        {riders.map((r) => (
          <option key={r._id} value={r._id}>
            {r.name} ({r.email})
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Ticket Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-white/10 border border-white/20 rounded px-3 py-2 w-full"
        required
      />
      <textarea
        placeholder="Describe the issue..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="bg-white/10 border border-white/20 rounded px-3 py-2 w-full"
        rows="4"
        required
      ></textarea>
      <button
        type="submit"
        className="cheetah-gradient-btn w-full sm:w-auto px-5 py-2 font-semibold self-end"
      >
        Create Ticket
      </button>
    </form>
  );
}