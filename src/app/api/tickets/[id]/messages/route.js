import { NextResponse } from 'next/server';
import { connectToDB } from '../../../../utils/db';
import Ticket from '../../../../models/Ticket';

export async function POST(req, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
  }

  await connectToDB();
  try {
    const { sender, content } = await req.json();
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    ticket.messages.push({ sender, content });
    await ticket.save();

    // Re-populate rider info before sending back
    const updatedTicket = await Ticket.findById(id).populate('rider', 'name');

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}