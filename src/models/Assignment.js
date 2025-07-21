import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
  bike: { type: mongoose.Schema.Types.ObjectId, ref: "Bike" },
  startDate: { type: Date, default: Date.now },
  tenureMonths: Number,
  monthlyCharge: Number,
  active: { type: Boolean, default: true },
});

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
