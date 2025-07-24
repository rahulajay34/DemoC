// src/app/api/maintenance/[id]/route.js
import { connectToDB } from "@/utils/db";
import Maintenance from "@/models/Maintenance";
import Bike from "@/models/Bike";

// GET /api/maintenance/[id] - Get a specific maintenance record
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    
    const maintenance = await Maintenance.findById(id)
      .populate('bike', 'make model number registrationNumber status')
      .lean();
    
    if (!maintenance) {
      return new Response(JSON.stringify({ 
        error: "Maintenance record not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ maintenance }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/maintenance/[id] error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch maintenance record",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT /api/maintenance/[id] - Update a maintenance record
export async function PUT(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    const body = await request.json();
    
    const maintenance = await Maintenance.findById(id);
    
    if (!maintenance) {
      return new Response(JSON.stringify({ 
        error: "Maintenance record not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Remove fields that shouldn't be updated directly
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;

    // Update maintenance record
    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      id, 
      { ...body, updatedAt: new Date() }, 
      { new: true, runValidators: true }
    ).populate('bike', 'make model number registrationNumber status');

    // If status is changed to completed, update bike status if needed
    if (body.status === 'completed' && maintenance.status !== 'completed') {
      const bike = await Bike.findById(maintenance.bike);
      if (bike && bike.status === 'maintenance') {
        await Bike.findByIdAndUpdate(maintenance.bike, {
          status: 'available'
        });
      }
    }

    return new Response(JSON.stringify({
      message: "Maintenance record updated successfully",
      maintenance: updatedMaintenance
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("PUT /api/maintenance/[id] error:", error);
    
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
      error: "Failed to update maintenance record",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE /api/maintenance/[id] - Soft delete a maintenance record
export async function DELETE(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    
    const maintenance = await Maintenance.findById(id);
    
    if (!maintenance) {
      return new Response(JSON.stringify({ 
        error: "Maintenance record not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If maintenance was in progress, update bike status back to available
    if (maintenance.status === 'in_progress') {
      const bike = await Bike.findById(maintenance.bike);
      if (bike && bike.status === 'maintenance') {
        await Bike.findByIdAndUpdate(maintenance.bike, {
          status: 'available'
        });
      }
    }

    // Soft delete the maintenance record
    await Maintenance.findByIdAndUpdate(id, {
      isActive: false,
      status: 'cancelled',
      updatedAt: new Date()
    });

    return new Response(JSON.stringify({
      message: "Maintenance record deleted successfully"
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("DELETE /api/maintenance/[id] error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to delete maintenance record",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
