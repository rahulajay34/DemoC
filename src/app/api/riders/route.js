// src/app/api/riders/route.js

import { connectToDB } from "../../../utils/db";
import Rider from "../../../models/Rider";

export async function GET() {
  await connectToDB();
  const riders = await Rider.find();
  return new Response(JSON.stringify(riders), { status: 200 });
}

export async function POST(request) {
  await connectToDB();
  const data = await request.json();
  const rider = await Rider.create(data);
  return new Response(JSON.stringify(rider), { status: 201 });
}
