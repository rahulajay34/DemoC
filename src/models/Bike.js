import mongoose from "mongoose";

const BikeSchema = new mongoose.Schema({
  make: String,
  model: String,
  number: { type: String, unique: true },
  status: { type: String, enum: ["available", "assigned"], default: "available" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", default: null },
});

export default mongoose.models.Bike || mongoose.model("Bike", BikeSchema);
