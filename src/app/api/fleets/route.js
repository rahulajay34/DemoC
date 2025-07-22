import { NextResponse } from 'next/server';
import { connectToDB } from '../../../utils/db'; // Corrected import
import Fleet from '../../../models/Fleet';
import Bike from '../../../models/Bike';

export async function GET() {
  await connectToDB(); // Corrected function call
  try {
    const fleets = await Fleet.find({});
    const fleetsWithDetails = await Promise.all(
      fleets.map(async (fleet) => {
        const bikesInFleet = await Bike.find({ fleet: fleet._id });
        const allottedBikes = bikesInFleet.filter(b => b.status === 'assigned');
        const unallottedBikes = bikesInFleet.filter(b => b.status !== 'assigned');
        
        const bikesByMake = await Bike.aggregate([
          { $match: { fleet: fleet._id } },
          { $group: { _id: '$make', count: { $sum: 1 } } }
        ]);

        return {
          ...fleet.toObject(),
          bikeCount: bikesInFleet.length,
          allottedCount: allottedBikes.length,
          unallottedCount: unallottedBikes.length,
          allottedBikes,
          unallottedBikes,
          bikesByMake
        };
      })
    );
    return NextResponse.json(fleetsWithDetails);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectToDB(); // Corrected function call
  try {
    const body = await req.json();
    const newFleet = new Fleet(body);
    await newFleet.save();
    return NextResponse.json(newFleet, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}