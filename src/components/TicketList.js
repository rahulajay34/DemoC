"use client";
import Link from "next/link";

export default function TicketList({ tickets }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "open":
        return "bg-green-500/20 text-green-300";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300";
      case "closed":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full w-full text-base">
        <thead className="border-b border-white/20">
          <tr>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Rider</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Created At</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket._id} className="border-b border-white/10">
              <td className="px-4 py-3">{ticket.title}</td>
              <td className="px-4 py-3">
                {/* Show rider name/email if populated, else fallback to N/A */}
                {ticket.rider && typeof ticket.rider === 'object' && (ticket.rider.name || ticket.rider.email)
                  ? `${ticket.rider.name || ''}${ticket.rider.email ? ` (${ticket.rider.email})` : ''}`
                  : 'N/A'}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusClass(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/tickets/${ticket._id}`}
                  className="text-orange-400 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}