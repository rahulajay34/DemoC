import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true },
  status: {
    type: String,
    enum: ["open", "pending", "closed"],
    default: "open",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);