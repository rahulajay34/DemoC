import { connectToDB } from "@/utils/db";
import Reply from "@/models/Reply";
import mongoose from "mongoose";

export async function GET(request, context) {
  try {
    await connectToDB();
    const { params } = context;
    const ticketId = params?.id;
    if (!ticketId) {
      return new Response("Ticket ID is required", { status: 400 });
    }
    const replies = await Reply.find({ ticketId: new mongoose.Types.ObjectId(ticketId) }).sort({
      createdAt: 1, // ascending order
    });
    // Ensure _id is a string for each reply
    const safeReplies = replies.map(r => {
      const obj = r.toObject();
      obj._id = obj._id.toString();
      return obj;
    });
    return new Response(JSON.stringify(safeReplies), { status: 200 });
  } catch (error) {
    console.error("Failed to fetch replies:", error);
    return new Response("Failed to fetch replies", { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await connectToDB();
    const { message, isStaff } = await request.json();
    // Ensure ticketId is an ObjectId
    const reply = await Reply.create({
      ticketId: new mongoose.Types.ObjectId(params.id),
      message,
      isStaff,
    });
    // Return _id as string
    const obj = reply.toObject();
    obj._id = obj._id.toString();
    return new Response(JSON.stringify(obj), { status: 201 });
  } catch (error) {
    console.error("Failed to create reply:", error);
    return new Response("Failed to create reply", { status: 500 });
  }
}