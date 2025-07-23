"use client";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/context/ToastContext";
import { FaPaperPlane } from "react-icons/fa";

// DEBUG: Log component renders
console.log("[ChatUI] Component render");

export default function ChatUI({ ticket }) {
  const [replies, setReplies] = useState([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const chatEndRef = useRef(null);

  // Debug logs
  useEffect(() => {
    console.log("[ChatUI] ticket:", ticket);
    console.log("[ChatUI] isSending:", isSending);
    console.log("[ChatUI] message:", message);
    console.log("[ChatUI] replies:", replies);
    if (ticket) {
      console.log("[ChatUI] ticket._id:", ticket._id, typeof ticket._id);
    }
    // Log input/button disabled state
    const inputDisabled = isSending || !ticket || !ticket._id;
    const buttonDisabled = !message.trim() || isSending || !ticket || !ticket._id;
    console.log("[ChatUI] inputDisabled:", inputDisabled);
    console.log("[ChatUI] buttonDisabled:", buttonDisabled);
  }, [ticket, isSending, message, replies]);

  // Ensure isSending is reset if ticket changes or on mount
  useEffect(() => {
    console.log("[ChatUI] ticket?._id changed:", ticket?._id);
    setIsSending(false);
  }, [ticket?._id]);

  useEffect(() => {
    if (ticket?._id) {
      console.log("[ChatUI] Fetching replies for ticket._id:", ticket._id);
      const fetchReplies = async () => {
        try {
          const res = await fetch(`/api/tickets/${ticket._id}/replies`);
          if (!res.ok) throw new Error("Failed to fetch replies");
          const data = await res.json();
          console.log("[ChatUI] Replies fetched:", data);
          setReplies(data);
        } catch (error) {
          toast.error(error.message);
          console.error("[ChatUI] Error fetching replies:", error);
        }
      };
      fetchReplies();
    } else {
      console.log("[ChatUI] No ticket._id, not fetching replies");
    }
    // The `ticket._id` is the only real dependency for fetching replies.
  }, [ticket?._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("[ChatUI] Scrolled to chat end. replies:", replies);
  }, [replies]);

  const handleReply = async (e) => {
    e.preventDefault();
    console.log("[ChatUI] handleReply called. message:", message, "isSending:", isSending);
    if (!message.trim() || isSending) {
      console.log("[ChatUI] handleReply: Not sending. message.trim():", message.trim(), "isSending:", isSending);
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticket._id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, isStaff: true }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      const newReply = await res.json();
      console.log("[ChatUI] Reply sent. newReply:", newReply);
      setReplies((prev) => [...prev, newReply]);
      setMessage("");
    } catch (error) {
      toast.error(error.message);
      console.error("[ChatUI] Error sending reply:", error);
    } finally {
      setIsSending(false);
      console.log("[ChatUI] handleReply finished. isSending set to false");
    }
  };

  // Fallback UI if ticket is missing
  if (!ticket || !ticket._id) {
    console.log("[ChatUI] No ticket or ticket._id. ticket:", ticket);
    return (
      <div className="flex flex-col flex-1 glass-card overflow-hidden items-center justify-center">
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No ticket selected</h2>
          <p className="text-white/60">Please select a ticket to view and reply.</p>
        </div>
      </div>
    );
  }

  console.log("[ChatUI] Rendering main UI. ticket:", ticket);
  return (
    <div className="flex flex-col flex-1 glass-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <h2 className="text-xl font-bold">{ticket.title}</h2>
        <p className="text-sm text-white/60">{ticket.description}</p>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {replies.map((reply) => (
          <div
            key={reply._id}
            className={`flex ${reply.isStaff ? "justify-end" : "justify-start"}`}
          >
            <p className={`chat-bubble ${reply.isStaff ? "staff" : "user"}`}>
              {reply.message}
            </p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-white/20">
        <form onSubmit={handleReply} className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              console.log("[ChatUI] Input onChange. value:", e.target.value);
              setMessage(e.target.value);
            }}
            placeholder="Type your reply..."
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
            disabled={isSending || !ticket || !ticket._id}
          />
          <button
            type="submit"
            className="ml-4 p-3 rounded-full cheetah-gradient-btn disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!message.trim() || isSending || !ticket || !ticket._id}
            onClick={() => {
              console.log("[ChatUI] Button clicked. message:", message, "isSending:", isSending, "ticket:", ticket);
            }}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}