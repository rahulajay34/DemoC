// src/app/api/riders/route.js

import { connectToDB } from "../../../utils/db";
import Rider from "../../../models/Rider";
import Assignment from "../../../models/Assignment";

export async function GET(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Rider.countDocuments(query);
    
    // Get riders with pagination and sorting
    const riders = await Rider.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .select('-documents -bankDetails'); // Exclude sensitive fields
    
    // Get analytics
    const analytics = await Rider.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    return new Response(JSON.stringify({
      riders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      analytics
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/riders error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch riders",
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
    const requiredFields = ['name', 'email', 'phone', 'licenseNumber', 'licenseExpiry', 'dateOfBirth'];
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
    
    // Check for duplicate email
    const existingRider = await Rider.findOne({ 
      $or: [
        { email: data.email },
        { licenseNumber: data.licenseNumber }
      ]
    });
    
    if (existingRider) {
      return new Response(JSON.stringify({ 
        error: "Rider with this email or license number already exists" 
      }), { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const rider = await Rider.create(data);
    
    // Remove sensitive fields from response
    const safeRider = await Rider.findById(rider._id).select('-documents -bankDetails');
    
    return new Response(JSON.stringify({
      message: "Rider created successfully",
      rider: safeRider
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("POST /api/riders error:", error);
    
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
      error: "Failed to create rider",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
