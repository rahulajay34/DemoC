import { connectToDB } from "@/utils/db";
import Ticket from "../../../models/Ticket";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDB();
    // Populate the rider field so we can show rider name/email in the table
    let tickets = await Ticket.find().populate({
      path: 'rider',
      select: 'name email',
      strictPopulate: false
    }).sort({ createdAt: -1 });
    // Ensure all tickets have rider as a plain object if populated
    const safeTickets = tickets.map(t => {
      const obj = t.toObject({ virtuals: true });
      if (obj.rider && typeof obj.rider === 'object') {
        obj.rider._id = obj.rider._id?.toString();
      }
      obj._id = obj._id.toString();
      // Always include the rider key, even if not populated
      if (!obj.rider) obj.rider = null;
      return obj;
    });
    return new Response(JSON.stringify(safeTickets), { status: 200 });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return new Response("Failed to fetch tickets", { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDB();
    const { title, description, rider } = await request.json();
    if (!rider) {
      return new Response("Rider is required", { status: 400 });
    }
    // Ensure rider is an ObjectId and always included
    const ticket = await Ticket.create({ title, description, rider: new mongoose.Types.ObjectId(rider) });
    // Populate the rider field for the response
    const populatedTicket = await Ticket.findById(ticket._id).populate({
      path: 'rider',
      select: 'name email',
      strictPopulate: false
    });
    // Convert to plain object for frontend
    const obj = populatedTicket.toObject({ virtuals: true });
    if (obj.rider && typeof obj.rider === 'object') {
      obj.rider._id = obj.rider._id?.toString();
    }
    obj._id = obj._id.toString();
    // Always include the rider key, even if not populated
    if (!obj.rider) obj.rider = null;
    return new Response(JSON.stringify(obj), { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return new Response("Failed to create ticket", { status: 500 });
  }
}