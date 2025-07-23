import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  message: { type: String, required: true },
  isStaff: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Reply || mongoose.model("Reply", ReplySchema);