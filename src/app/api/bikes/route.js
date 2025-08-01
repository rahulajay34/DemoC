import { connectToDB } from "../../../utils/db";
import Bike from "../../../models/Bike.js";
import Assignment from "../../../models/Assignment";
import Maintenance from "../../../models/Maintenance";

export async function GET(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const zone = searchParams.get('zone') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { number: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (zone) {
      query['location.zone'] = zone;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Bike.countDocuments(query);
    
    // Get bikes with pagination and sorting
    const bikes = await Bike.find(query)
      .populate('assignedTo', 'name email phone')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .select('-documents -insurance -maintenance.serviceHistory');
    
    // Get analytics
    const analytics = await Bike.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          avgAge: { $avg: { $subtract: [new Date().getFullYear(), '$year'] } }
        }
      }
    ]);
    
    // Get type distribution
    const typeDistribution = await Bike.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          available: { 
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          }
        }
      }
    ]);

    return new Response(JSON.stringify({
      bikes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      analytics,
      typeDistribution
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/bikes error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch bikes",
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
    const requiredFields = ['make', 'model', 'number', 'registrationNumber', 'chassisNumber', 'engineNumber', 'year', 'type', 'fuelType', 'color', 'purchaseDate', 'purchasePrice'];
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
    
    // Check for duplicate numbers
    const existingBike = await Bike.findOne({ 
      $or: [
        { number: data.number },
        { registrationNumber: data.registrationNumber },
        { chassisNumber: data.chassisNumber },
        { engineNumber: data.engineNumber }
      ]
    });
    
    if (existingBike) {
      return new Response(JSON.stringify({ 
        error: "Bike with this number, registration, chassis, or engine number already exists" 
      }), { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const bike = await Bike.create(data);
    
    return new Response(JSON.stringify({
      message: "Bike created successfully",
      bike
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("POST /api/bikes error:", error);
    
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
      error: "Failed to create bike",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
