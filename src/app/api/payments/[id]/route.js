// src/app/api/payments/[id]/route.js
import { connectToDB } from "@/utils/db";
import Payment from "@/models/Payment";
import Assignment from "@/models/Assignment";

// GET /api/payments/[id] - Get a specific payment
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    
    const payment = await Payment.findById(id)
      .populate('rider', 'name email phone')
      .populate('assignment', 'assignmentId startDate endDate')
      .lean();
    
    if (!payment) {
      return new Response(JSON.stringify({ 
        error: "Payment not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ payment }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/payments/[id] error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch payment",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT /api/payments/[id] - Update a payment
export async function PUT(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    const body = await request.json();
    
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return new Response(JSON.stringify({ 
        error: "Payment not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Remove fields that shouldn't be updated directly
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;

    // If status is being changed to paid, set paidDate
    if (body.status === 'paid' && payment.status !== 'paid') {
      body.paidDate = new Date();
    }

    // Update payment
    const updatedPayment = await Payment.findByIdAndUpdate(
      id, 
      { ...body, updatedAt: new Date() }, 
      { new: true, runValidators: true }
    ).populate('rider', 'name email phone')
     .populate('assignment', 'assignmentId startDate endDate');

    // Update assignment payment status if needed
    if (payment.assignment && body.status) {
      const assignment = await Assignment.findById(payment.assignment);
      if (assignment) {
        const allPayments = await Payment.find({ 
          assignment: payment.assignment,
          isActive: true 
        });
        
        const totalPaid = allPayments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);
        
        const totalPending = allPayments
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0);

        await Assignment.findByIdAndUpdate(payment.assignment, {
          paidAmount: totalPaid,
          pendingAmount: totalPending,
          paymentStatus: totalPending > 0 ? 'pending' : 'paid'
        });
      }
    }

    return new Response(JSON.stringify({
      message: "Payment updated successfully",
      payment: updatedPayment
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("PUT /api/payments/[id] error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return new Response(JSON.stringify({ 
        error: "Validation error", 
        details: errors 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      error: "Failed to update payment",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE /api/payments/[id] - Soft delete a payment
export async function DELETE(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return new Response(JSON.stringify({ 
        error: "Payment not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Soft delete the payment
    await Payment.findByIdAndUpdate(id, {
      isActive: false,
      status: 'cancelled',
      updatedAt: new Date()
    });

    // Update assignment payment status if needed
    if (payment.assignment) {
      const assignment = await Assignment.findById(payment.assignment);
      if (assignment) {
        const allActivePayments = await Payment.find({ 
          assignment: payment.assignment,
          isActive: true 
        });
        
        const totalPaid = allActivePayments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);
        
        const totalPending = allActivePayments
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0);

        await Assignment.findByIdAndUpdate(payment.assignment, {
          paidAmount: totalPaid,
          pendingAmount: totalPending,
          paymentStatus: totalPending > 0 ? 'pending' : 'paid'
        });
      }
    }

    return new Response(JSON.stringify({
      message: "Payment deleted successfully"
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("DELETE /api/payments/[id] error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to delete payment",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
