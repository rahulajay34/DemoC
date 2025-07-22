"use client";
import { useState, useEffect } from "react";
import { FormModal } from "../../components/FormModal";
import { useToast } from "../../context/ToastContext";

export default function TicketingPage() {
  const [tickets, setTickets] = useState([]);
  const [riders, setRiders] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchTickets = () => {
    fetch("/api/tickets")
      .then(res => res.json())
      .then(data => setTickets(data));
  };

  useEffect(() => {
    fetchTickets();
    fetch("/api/riders")
      .then(res => res.json())
      .then(data => setRiders(data));
  }, []);

  const handleCreateTicket = () => setIsModalOpen(true);

  const handleTicketSubmit = async (formData) => {
    const { rider, subject, content } = formData;
    const newTicketData = {
      rider,
      subject,
      messages: [{ sender: 'admin', content }],
    };

    try {
        const res = await fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTicketData),
        });

        if (res.ok) {
            showToast("Ticket created successfully!", "success");
            fetchTickets(); // Refresh the list
        } else {
            throw new Error('Failed to create ticket');
        }
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        setIsModalOpen(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !message) return;
    
    // Optimistically update the UI
    const newMessage = { sender: 'admin', content: message, timestamp: new Date().toISOString() };
    const updatedTicket = { ...selectedTicket, messages: [...selectedTicket.messages, newMessage] };
    setSelectedTicket(updatedTicket);
    setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
    setMessage("");

    // Make the API call
    const res = await fetch(`/api/tickets/${selectedTicket._id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'admin', content: message }),
    });

    if (!res.ok) {
        showToast("Failed to send message.", "error");
        // Revert the optimistic update if the API call fails
        setSelectedTicket(selectedTicket);
        setTickets(tickets);
    }
  };

  const ticketFormFields = [
    { name: 'rider', label: 'Rider', type: 'select', options: riders.map(r => ({ value: r._id, label: r.name })) },
    { name: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g., Payment Issue' },
    { name: 'content', label: 'Initial Message', type: 'textarea', placeholder: 'Enter the first message...' },
  ];

  return (
    <>
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTicketSubmit}
        fields={ticketFormFields}
        title="Create New Ticket"
      />
      <section className="animate-fade-in glass-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Ticketing</h2>
            <button onClick={handleCreateTicket} className="cheetah-gradient-btn">
                Create Ticket
            </button>
        </div>
        <div className="flex flex-col md:flex-row gap-8" style={{ height: '70vh' }}>
          <div className="w-full md:w-1/3 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Tickets</h3>
            <ul>
              {tickets.map(ticket => (
                <li key={ticket._id} onClick={() => setSelectedTicket(ticket)} className={`cursor-pointer p-3 my-1 rounded-lg transition-colors ${selectedTicket?._id === ticket._id ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                  <p className="font-bold">{ticket.subject}</p>
                  {/* ✨ THE FIX IS HERE ✨ */}
                  <p className="text-sm text-white/70">
                    {ticket.rider?.name || 'Unknown Rider'} - {ticket.status}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-2/3 flex flex-col">
            {selectedTicket ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 bg-black/20 rounded-lg mb-4">
                  {selectedTicket.messages.map((msg, index) => (
                    <div key={index} className={`max-w-xs p-3 my-2 rounded-lg ${msg.sender === 'admin' ? 'bg-orange-600 ml-auto' : 'bg-gray-700 mr-auto'}`}>
                      <p>{msg.content}</p>
                      <p className="text-xs text-white/50 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2"
                    placeholder="Type your message..."
                  />
                  <button onClick={handleSendMessage} className="cheetah-gradient-btn ml-4">Send</button>
                </div>
              </>
            ) : (
                <div className="flex-1 flex justify-center items-center p-4 bg-black/20 rounded-lg">
                    <p className="text-white/50">Select a ticket to view messages.</p>
                </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}