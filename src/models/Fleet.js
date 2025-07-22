import mongoose from "mongoose";

const FleetSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Delhi", "Bangalore"
  location: String,
});

export default mongoose.models.Fleet || mongoose.model("Fleet", FleetSchema);