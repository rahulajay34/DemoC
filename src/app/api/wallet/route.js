import { NextResponse } from 'next/server';
import { connectToDB } from '../../../utils/db'; // Corrected import
import Transaction from '../../../models/Transaction';
import Rider from '../../../models/Rider';

export async function GET() {
  await connectToDB(); // Corrected function call
  try {
    const transactions = await Transaction.find({}).populate('rider', 'name');
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectToDB(); // Corrected function call
  try {
    const body = await req.json();
    const newTransaction = new Transaction(body);
    await newTransaction.save();
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}