// src/app/api/bikes/[id]/route.js

import { connectToDB } from "../../../../utils/db";
import Bike from "../../../../models/Bike";
import Assignment from "../../../../models/Assignment";
import Maintenance from "../../../../models/Maintenance";

export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeAssignments = searchParams.get('includeAssignments') === 'true';
    const includeMaintenance = searchParams.get('includeMaintenance') === 'true';
    
    const bike = await Bike.findById(id).populate('assignedTo', 'name email phone');
    
    if (!bike) {
      return new Response(JSON.stringify({ 
        error: "Bike not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = { bike };
    
    if (includeAssignments) {
      const assignments = await Assignment.find({ bike: id })
        .populate('rider', 'name email phone')
        .sort({ createdAt: -1 });
      result.assignments = assignments;
    }
    
    if (includeMaintenance) {
      const maintenance = await Maintenance.find({ bike: id })
        .sort({ createdAt: -1 })
        .limit(20);
      result.maintenance = maintenance;
    }
    
    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`GET /api/bikes/${params.id} error:`, error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch bike",
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
    
    const bike = await Bike.findById(id);
    
    if (!bike) {
      return new Response(JSON.stringify({ 
        error: "Bike not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check for duplicate numbers if being updated
    const duplicateFields = ['number', 'registrationNumber', 'chassisNumber', 'engineNumber'];
    for (const field of duplicateFields) {
      if (data[field] && data[field] !== bike[field]) {
        const existingBike = await Bike.findOne({ 
          [field]: data[field], 
          _id: { $ne: id } 
        });
        if (existingBike) {
          return new Response(JSON.stringify({ 
            error: `${field} already exists` 
          }), { 
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    const updatedBike = await Bike.findByIdAndUpdate(
      id, 
      data, 
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email phone');
    
    return new Response(JSON.stringify({
      message: "Bike updated successfully",
      bike: updatedBike
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`PUT /api/bikes/${params.id} error:`, error);
    
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
      error: "Failed to update bike",
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
    
    const bike = await Bike.findById(id);
    
    if (!bike) {
      return new Response(JSON.stringify({ 
        error: "Bike not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if bike has active assignments
    const activeAssignments = await Assignment.find({ 
      bike: id, 
      status: 'active' 
    });
    
    if (activeAssignments.length > 0) {
      return new Response(JSON.stringify({ 
        error: "Cannot delete bike with active assignments. Please complete or terminate assignments first.",
        activeAssignments: activeAssignments.length
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Soft delete by setting status to retired and isActive to false
    const updatedBike = await Bike.findByIdAndUpdate(
      id,
      { status: 'retired', isActive: false },
      { new: true }
    );
    
    return new Response(JSON.stringify({
      message: "Bike retired successfully",
      bike: updatedBike
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`DELETE /api/bikes/${params.id} error:`, error);
    return new Response(JSON.stringify({ 
      error: "Failed to delete bike",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
