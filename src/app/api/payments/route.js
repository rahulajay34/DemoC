// src/app/api/payments/route.js

import { connectToDB } from "../../../utils/db";
import Payment from "../../../models/Payment";
import Assignment from "../../../models/Assignment";
import Rider from "../../../models/Rider";

export async function GET(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const riderId = searchParams.get('riderId') || '';
    const assignmentId = searchParams.get('assignmentId') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = { isActive: true };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (riderId) {
      query.rider = riderId;
    }
    
    if (assignmentId) {
      query.assignment = assignmentId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Payment.countDocuments(query);
    
    // Get payments with pagination and sorting
    const payments = await Payment.find(query)
      .populate('rider', 'name email phone')
      .populate('assignment', 'assignmentId startDate endDate')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);
    
    // Get analytics
    const analytics = await Payment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);
    
    // Get payment method distribution
    const methodDistribution = await Payment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get overdue payments
    const overduePayments = await Payment.countDocuments({
      isActive: true,
      status: 'overdue'
    });

    return new Response(JSON.stringify({
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      analytics,
      methodDistribution,
      overdueCount: overduePayments
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch payments",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    await connectToDB();
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['assignment', 'rider', 'type', 'amount', 'dueDate', 'paymentMethod'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(JSON.stringify({ 
          error: `${field} is required` 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Check if assignment exists
    const assignment = await Assignment.findById(data.assignment);
    if (!assignment) {
      return new Response(JSON.stringify({ 
        error: "Assignment not found" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if rider exists
    const rider = await Rider.findById(data.rider);
    if (!rider) {
      return new Response(JSON.stringify({ 
        error: "Rider not found" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create payment record
    const payment = await Payment.create(data);
    
    // If payment is successful, update assignment
    if (data.status === 'paid') {
      await Assignment.findByIdAndUpdate(data.assignment, {
        $inc: { paidAmount: data.amount }
      });
    }
    
    // Populate the created payment
    const populatedPayment = await Payment.findById(payment._id)
      .populate('rider', 'name email phone')
      .populate('assignment', 'assignmentId');
    
    return new Response(JSON.stringify({
      message: "Payment record created successfully",
      payment: populatedPayment
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return new Response(JSON.stringify({ 
        error: "Validation failed",
        details: validationErrors 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      error: "Failed to create payment record",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
