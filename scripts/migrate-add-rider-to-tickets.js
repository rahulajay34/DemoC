// Migration script to add a default rider to tickets missing the rider field
import mongoose from "mongoose";
import Ticket from "../src/models/Ticket.js";
import Rider from "../src/models/Rider.js";
import { connectToDB } from "../src/utils/db.js";

async function migrate() {
  await connectToDB();
  // Find a default rider (first one)
  const defaultRider = await Rider.findOne();
  if (!defaultRider) {
    console.error("No riders found. Please create a rider first.");
    process.exit(1);
  }
  // Update all tickets missing the rider field
  const result = await Ticket.updateMany(
    { $or: [ { rider: { $exists: false } }, { rider: null } ] },
    { $set: { rider: defaultRider._id } }
  );
  console.log(`Updated ${result.modifiedCount} tickets to have rider: ${defaultRider._id}`);
  process.exit(0);
}

migrate();
