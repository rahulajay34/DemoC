// src/app/api/assignments/route.js

import { connectToDB } from "@/utils/db";
import Assignment from "@/models/Assignment";
import Rider from "../../../models/Rider";
import Bike from "../../../models/Bike";

export async function GET(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || '';
    const riderId = searchParams.get('riderId') || '';
    const bikeId = searchParams.get('bikeId') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = { isActive: true };
    
    if (status) {
      query.status = status;
    }
    
    if (riderId) {
      query.rider = riderId;
    }
    
    if (bikeId) {
      query.bike = bikeId;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Assignment.countDocuments(query);
    
    // Get assignments with pagination and sorting
    const assignments = await Assignment.find(query)
      .populate('rider', 'name email phone status rating')
      .populate('bike', 'make model number status type')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);
    
    // Get analytics
    const analytics = await Assignment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgMonthlyCharge: { $avg: '$monthlyCharge' }
        }
      }
    ]);
    
    // Get payment status distribution
    const paymentAnalytics = await Assignment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          pendingAmount: { $sum: '$pendingAmount' }
        }
      }
    ]);

    return new Response(JSON.stringify({
      assignments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      analytics,
      paymentAnalytics
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/assignments error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch assignments",
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
    const requiredFields = ['rider', 'bike', 'tenureMonths', 'monthlyCharge', 'securityDeposit'];
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
    
    // Check if rider exists and is active
    const rider = await Rider.findById(data.rider);
    if (!rider || rider.status !== 'active') {
      return new Response(JSON.stringify({ 
        error: "Rider not found or not active" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if bike exists and is available
    const bike = await Bike.findById(data.bike);
    if (!bike || bike.status !== 'available') {
      return new Response(JSON.stringify({ 
        error: "Bike not found or not available" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if rider already has maximum assignments (configurable limit)
    const riderActiveAssignments = await Assignment.countDocuments({
      rider: data.rider,
      status: 'active'
    });
    
    const maxAssignmentsPerRider = 3; // Configurable
    if (riderActiveAssignments >= maxAssignmentsPerRider) {
      return new Response(JSON.stringify({ 
        error: `Rider already has maximum number of active assignments (${maxAssignmentsPerRider})` 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create assignment
    const assignment = await Assignment.create(data);
    
    // Update bike status and assignment
    await Bike.findByIdAndUpdate(data.bike, {
      status: 'assigned',
      assignedTo: data.rider,
      assignedAt: new Date(),
      $inc: { totalAssignments: 1 }
    });
    
    // Update rider assignment counts
    await Rider.findByIdAndUpdate(data.rider, {
      $inc: { 
        totalAssignments: 1,
        currentAssignments: 1
      }
    });
    
    // Populate the created assignment
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('rider', 'name email phone')
      .populate('bike', 'make model number');
    
    return new Response(JSON.stringify({
      message: "Assignment created successfully",
      assignment: populatedAssignment
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("POST /api/assignments error:", error);
    
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
      error: "Failed to create assignment",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request) {
  try {
    // Extract the assignment id from the query string
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
    }

    // Delete the assignment, free the bike
    await connectToDB();
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return new Response(JSON.stringify({ error: "Assignment not found" }), { status: 404 });
    }

    // Set the bike as available again
    await Bike.findByIdAndUpdate(assignment.bike, {
      status: "available",
      assignedTo: null,
    });

    // Update rider assignment counts
    await Rider.findByIdAndUpdate(assignment.rider, {
      $inc: { currentAssignments: -1 }
    });

    // Soft delete the assignment
    await Assignment.findByIdAndUpdate(id, {
      status: 'terminated',
      isActive: false,
      endDate: new Date()
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Assignment terminated successfully"
    }), { status: 200 });
  } catch (error) {
    console.error("DELETE assignments error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete assignment" }), { status: 500 });
  }
}

