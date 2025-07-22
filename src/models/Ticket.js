import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
  subject: String,
  messages: [
    {
      sender: { type: String, enum: ['rider', 'admin'] },
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  status: { type: String, enum: ["open", "closed"], default: "open" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);