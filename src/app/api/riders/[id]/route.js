// src/app/api/riders/[id]/route.js

import { connectToDB } from "../../../../utils/db";
import Rider from "../../../../models/Rider";
import Assignment from "../../../../models/Assignment";
import Payment from "../../../../models/Payment";

export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeAssignments = searchParams.get('includeAssignments') === 'true';
    const includePayments = searchParams.get('includePayments') === 'true';
    
    const rider = await Rider.findById(id).select('-documents -bankDetails');
    
    if (!rider) {
      return new Response(JSON.stringify({ 
        error: "Rider not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = { rider };
    
    if (includeAssignments) {
      const assignments = await Assignment.find({ rider: id })
        .populate('bike', 'make model number status')
        .sort({ createdAt: -1 });
      result.assignments = assignments;
    }
    
    if (includePayments) {
      const payments = await Payment.find({ rider: id })
        .populate('assignment', 'assignmentId startDate endDate')
        .sort({ createdAt: -1 })
        .limit(50);
      result.payments = payments;
    }
    
    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`GET /api/riders/${params.id} error:`, error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch rider",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    const data = await request.json();
    
    // Remove fields that shouldn't be updated directly
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;
    
    const rider = await Rider.findById(id);
    
    if (!rider) {
      return new Response(JSON.stringify({ 
        error: "Rider not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check for duplicate email/license if being updated
    if (data.email && data.email !== rider.email) {
      const existingRider = await Rider.findOne({ 
        email: data.email, 
        _id: { $ne: id } 
      });
      if (existingRider) {
        return new Response(JSON.stringify({ 
          error: "Email already exists" 
        }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    if (data.licenseNumber && data.licenseNumber !== rider.licenseNumber) {
      const existingRider = await Rider.findOne({ 
        licenseNumber: data.licenseNumber, 
        _id: { $ne: id } 
      });
      if (existingRider) {
        return new Response(JSON.stringify({ 
          error: "License number already exists" 
        }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    const updatedRider = await Rider.findByIdAndUpdate(
      id, 
      { ...data, lastActive: new Date() }, 
      { new: true, runValidators: true }
    ).select('-documents -bankDetails');
    
    return new Response(JSON.stringify({
      message: "Rider updated successfully",
      rider: updatedRider
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`PUT /api/riders/${params.id} error:`, error);
    
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
      error: "Failed to update rider",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    
    const rider = await Rider.findById(id);
    
    if (!rider) {
      return new Response(JSON.stringify({ 
        error: "Rider not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if rider has active assignments
    const activeAssignments = await Assignment.find({ 
      rider: id, 
      status: 'active' 
    });
    
    if (activeAssignments.length > 0) {
      return new Response(JSON.stringify({ 
        error: "Cannot delete rider with active assignments. Please complete or terminate assignments first.",
        activeAssignments: activeAssignments.length
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Soft delete by setting status to inactive
    const updatedRider = await Rider.findByIdAndUpdate(
      id,
      { status: 'inactive', isActive: false },
      { new: true }
    ).select('-documents -bankDetails');
    
    return new Response(JSON.stringify({
      message: "Rider deactivated successfully",
      rider: updatedRider
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`DELETE /api/riders/${params.id} error:`, error);
    return new Response(JSON.stringify({ 
      error: "Failed to delete rider",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
