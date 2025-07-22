import { NextResponse } from 'next/server';
import { connectToDB } from '../../../../utils/db';
import Bike from '../../../../models/Bike';
import Rider from '../../../../models/Rider';
import Fleet from '../../../../models/Fleet';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const number = searchParams.get('number');

  if (!number) {
    return NextResponse.json({ error: 'Bike number is required' }, { status: 400 });
  }

  await connectToDB();
  try {
    const bike = await Bike.findOne({ number: number }).populate('assignedTo').populate('fleet');
    if (!bike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }
    return NextResponse.json(bike);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}