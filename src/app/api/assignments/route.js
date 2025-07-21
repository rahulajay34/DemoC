// src/app/api/assignments/route.js

import { connectToDB } from "@/utils/db";
import Assignment from "@/models/Assignment";
import Bike from "../../../models/Bike";

export async function GET() {
  try {
    await connectToDB();
    const assignments = await Assignment.find()
      .populate("rider")
      .populate("bike");
    return new Response(JSON.stringify(assignments), { status: 200 });
  } catch (error) {
    console.error("GET assignments error:", error);
    return new Response("Failed to fetch assignments", { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDB();
    const { rider, bike, tenureMonths, monthlyCharge } = await request.json();

    // Update bike to set it as assigned
    await Bike.findByIdAndUpdate(bike, {
      status: "assigned",
      assignedTo: rider,
    });

    const assignment = await Assignment.create({
      rider,
      bike,
      tenureMonths,
      monthlyCharge,
      startDate: new Date(),
      active: true,
    });

    return new Response(JSON.stringify(assignment), { status: 201 });
  } catch (error) {
    console.error("POST assignments error:", error);
    return new Response("Failed to create assignment", { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Extract the assignment id from the query string
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
    }

    // Delete the assignment, free the bike
    await connectToDB();
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return new Response(JSON.stringify({ error: "Assignment not found" }), { status: 404 });
    }

    // Set the bike as available again
    await Bike.findByIdAndUpdate(assignment.bike, {
      status: "available",
      assignedTo: null,
    });

    await Assignment.findByIdAndDelete(id);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("DELETE assignments error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete assignment" }), { status: 500 });
  }
}

