import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Reply message is required'],
    trim: true,
    maxlength: [1000, 'Reply message cannot be more than 1000 characters']
  },
  author: {
    type: String,
    required: [true, 'Reply author is required'],
    enum: ['admin', 'rider', 'system'],
    default: 'admin'
  },
  authorName: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  isInternal: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Ticket title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Ticket description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Ticket category is required'],
    enum: ['technical', 'billing', 'maintenance', 'general', 'complaint', 'suggestion'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'pending', 'resolved', 'closed'],
    default: 'open'
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: false
  },
  assignedTo: {
    type: String,
    trim: true
  },
  attachment: {
    filename: String,
    url: String,
    type: String
  },
  replies: [ReplySchema],
  tags: [String],
  resolution: {
    message: String,
    resolvedBy: String,
    resolvedAt: Date
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'email', 'phone'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-generate ticket ID
TicketSchema.pre('save', function(next) {
  if (!this.ticketId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.ticketId = `TK-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Indexes for better performance
TicketSchema.index({ ticketId: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ rider: 1 });
TicketSchema.index({ createdAt: -1 });

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);