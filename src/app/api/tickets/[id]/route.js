import { connectToDB } from "@/utils/db";
import Ticket from "@/models/Ticket";

export async function GET(request, { params }) {
  try {
    await connectToDB();
    const ticket = await Ticket.findById(params.id).populate({
      path: 'rider',
      select: 'name email',
      strictPopulate: false
    });

    if (!ticket) {
      return new Response("Ticket not found", { status: 404 });
    }

    // Convert to plain object and ensure _id is a string
    const plainTicket = ticket.toObject({ virtuals: true });
    plainTicket._id = plainTicket._id.toString();
    if (plainTicket.rider && typeof plainTicket.rider === 'object') {
      plainTicket.rider._id = plainTicket.rider._id?.toString();
    }
    if (!plainTicket.rider) plainTicket.rider = null;
    return new Response(JSON.stringify(plainTicket), { status: 200 });
  } catch (error) {
    console.error("Failed to fetch ticket:", error); // It's good practice to log the actual error on the server
    return new Response("Failed to fetch ticket", { status: 500 });
  }
}