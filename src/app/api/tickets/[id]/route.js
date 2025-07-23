import { connectToDB } from "@/utils/db";
import Ticket from "@/models/Ticket";

// GET /api/tickets/[id] - Get a specific ticket
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    
    const ticket = await Ticket.findById(id)
      .populate('rider', 'name email phone')
      .lean();
    
    if (!ticket) {
      return new Response(JSON.stringify({ 
        error: "Ticket not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ ticket }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/tickets/[id] error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch ticket" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT /api/tickets/[id] - Update a ticket
export async function PUT(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    const body = await request.json();
    
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return new Response(JSON.stringify({ 
        error: "Ticket not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update fields
    Object.keys(body).forEach(key => {
      if (key !== '_id' && key !== 'ticketId' && key !== 'createdAt') {
        ticket[key] = body[key];
      }
    });

    // If status is being changed to resolved, add resolution info
    if (body.status === 'resolved' && !ticket.resolution.resolvedAt) {
      ticket.resolution = {
        message: body.resolutionMessage || 'Ticket resolved',
        resolvedBy: body.resolvedBy || 'admin',
        resolvedAt: new Date()
      };
    }

    await ticket.save();
    await ticket.populate('rider', 'name email phone');

    return new Response(JSON.stringify({
      message: "Ticket updated successfully",
      ticket
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("PUT /api/tickets/[id] error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to update ticket" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE /api/tickets/[id] - Soft delete a ticket
export async function DELETE(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return new Response(JSON.stringify({ 
        error: "Ticket not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Soft delete
    ticket.isActive = false;
    await ticket.save();

    return new Response(JSON.stringify({
      message: "Ticket deleted successfully"
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("DELETE /api/tickets/[id] error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to delete ticket" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}