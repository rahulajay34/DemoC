// src/app/api/maintenance/route.js

import { connectToDB } from "../../../utils/db";
import Maintenance from "../../../models/Maintenance";
import Bike from "../../../models/Bike";

export async function GET(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const priority = searchParams.get('priority') || '';
    const bikeId = searchParams.get('bikeId') || '';
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
    
    if (priority) {
      query.priority = priority;
    }
    
    if (bikeId) {
      query.bike = bikeId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Maintenance.countDocuments(query);
    
    // Get maintenance records with pagination and sorting
    const maintenanceRecords = await Maintenance.find(query)
      .populate('bike', 'make model number registrationNumber status')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);
    
    // Get analytics
    const analytics = await Maintenance.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost.total' },
          avgDuration: { $avg: '$actualDuration' }
        }
      }
    ]);
    
    // Get priority distribution
    const priorityDistribution = await Maintenance.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          avgCost: { $avg: '$cost.total' }
        }
      }
    ]);

    return new Response(JSON.stringify({
      maintenance: maintenanceRecords,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      analytics,
      priorityDistribution
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/maintenance error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch maintenance records",
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
    const requiredFields = ['bike', 'type', 'category', 'description', 'scheduledDate'];
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
    
    // Check if bike exists
    const bike = await Bike.findById(data.bike);
    if (!bike) {
      return new Response(JSON.stringify({ 
        error: "Bike not found" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create maintenance record
    const maintenance = await Maintenance.create(data);
    
    // Update bike status if maintenance is urgent
    if (data.priority === 'critical' && bike.status === 'available') {
      await Bike.findByIdAndUpdate(data.bike, {
        status: 'maintenance'
      });
    }
    
    // Populate the created maintenance record
    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('bike', 'make model number registrationNumber');
    
    return new Response(JSON.stringify({
      message: "Maintenance record created successfully",
      maintenance: populatedMaintenance
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("POST /api/maintenance error:", error);
    
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
      error: "Failed to create maintenance record",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
