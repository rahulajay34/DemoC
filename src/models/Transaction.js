import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
  type: { type: String, enum: ['monthly_charge', 'security_deposit', 'extra_charge', 'refund'] },
  amount: Number,
  description: String,
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);