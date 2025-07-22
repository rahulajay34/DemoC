import { NextResponse } from 'next/server';
import { connectToDB } from '../../../utils/db';
import Ticket from '../../../models/Ticket';
import Rider from '../../../models/Rider';

export async function GET() {
  await connectToDB();
  try {
    const tickets = await Ticket.find({}).sort({ createdAt: -1 }).populate('rider', 'name');
    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectToDB();
  try {
    const body = await req.json();
    const newTicket = new Ticket(body);
    await newTicket.save();
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}