import mongoose from "mongoose";

const BikeSchema = new mongoose.Schema({
  make: String,
  model: String,
  number: { type: String, unique: true },
  status: { type: String, enum: ["available", "assigned", "damaged"], default: "available" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", default: null },
  fleet: { type: mongoose.Schema.Types.ObjectId, ref: "Fleet" }, // New field
  condition: { type: String, enum: ['good', 'damaged'], default: 'good' }, // New field
  allotmentTime: { type: Date, default: null }, // To track allotment time
});

export default mongoose.models.Bike || mongoose.model("Bike", BikeSchema);