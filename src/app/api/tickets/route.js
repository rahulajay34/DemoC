import { connectToDB } from "@/utils/db";
import Ticket from "@/models/Ticket";
import Rider from "@/models/Rider";

// GET /api/tickets - Get all tickets with filtering and pagination
export async function GET(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const priority = searchParams.get('priority') || '';
    const riderId = searchParams.get('riderId') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (riderId) {
      query.rider = riderId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get tickets with population
    const tickets = await Ticket.find(query)
      .populate('rider', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Ticket.countDocuments(query);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return new Response(JSON.stringify({
      tickets,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch tickets" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request) {
  try {
    await connectToDB();
    
    const body = await request.json();
    const {
      title,
      description,
      category,
      priority,
      riderId,
      attachment,
      tags,
      metadata
    } = body;

    // Validate required fields
    if (!title || !description) {
      return new Response(JSON.stringify({ 
        error: "Title and description are required" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate rider if provided
    if (riderId) {
      const rider = await Rider.findById(riderId);
      if (!rider) {
        return new Response(JSON.stringify({ 
          error: "Rider not found" 
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Create new ticket
    const ticket = new Ticket({
      title,
      description,
      category,
      priority,
      rider: riderId || null,
      attachment,
      tags,
      metadata
    });

    await ticket.save();

    // Populate rider info for response
    await ticket.populate('rider', 'name email phone');

    return new Response(JSON.stringify({
      message: "Ticket created successfully",
      ticket
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to create ticket" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}