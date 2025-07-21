import mongoose from "mongoose";

const RiderSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  address: String,
  joinedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Rider || mongoose.model("Rider", RiderSchema);
