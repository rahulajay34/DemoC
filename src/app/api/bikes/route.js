import { connectToDB } from "../../../utils/db";
import Bike from "../../../models/Bike.js";

export async function GET(req) {
  try {
    await connectToDB();
    const bikes = await Bike.find();
    return new Response(JSON.stringify(bikes), { status: 200 });
  } catch (error) {
    console.error("GET /api/bikes error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch bikes" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    const data = await req.json();
    const bike = await Bike.create(data);
    return new Response(JSON.stringify(bike), { status: 201 });
  } catch (error) {
    console.error("POST /api/bikes error:", error);
    return new Response(JSON.stringify({ error: "Failed to create bike" }), { status: 500 });
  }
}
