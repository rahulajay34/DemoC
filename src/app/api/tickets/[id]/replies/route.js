import { connectToDB } from "@/utils/db";
import Ticket from "@/models/Ticket";

// GET /api/tickets/[id]/replies - Get all replies for a ticket
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeInternal = searchParams.get('includeInternal') === 'true';
    
    const ticket = await Ticket.findById(id).select('replies');
    
    if (!ticket) {
      return new Response(JSON.stringify({ 
        error: "Ticket not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Filter replies based on includeInternal flag
    let replies = ticket.replies;
    if (!includeInternal) {
      replies = replies.filter(reply => !reply.isInternal);
    }

    // Sort replies by creation date (oldest first)
    replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return new Response(JSON.stringify({ 
      replies,
      total: replies.length
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/tickets/[id]/replies error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch replies" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST /api/tickets/[id]/replies - Add a reply to a ticket
export async function POST(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    const body = await request.json();
    const {
      message,
      author = 'admin',
      authorName,
      attachments,
      isInternal = false
    } = body;

    // Validate required fields
    if (!message) {
      return new Response(JSON.stringify({ 
        error: "Reply message is required" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return new Response(JSON.stringify({ 
        error: "Ticket not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new reply
    const newReply = {
      message,
      author,
      authorName,
      attachments,
      isInternal,
      createdAt: new Date()
    };

    ticket.replies.push(newReply);
    
    // Update ticket status if it was closed and a non-internal reply is added
    if (ticket.status === 'closed' && !isInternal) {
      ticket.status = 'open';
    }

    await ticket.save();

    // Get the newly added reply (last one in the array)
    const addedReply = ticket.replies[ticket.replies.length - 1];

    return new Response(JSON.stringify({
      message: "Reply added successfully",
      reply: addedReply
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("POST /api/tickets/[id]/replies error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to add reply" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE /api/tickets/[id]/replies - Delete a specific reply
export async function DELETE(request, { params }) {
  try {
    await connectToDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const replyId = searchParams.get('replyId');

    if (!replyId) {
      return new Response(JSON.stringify({ 
        error: "Reply ID is required" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return new Response(JSON.stringify({ 
        error: "Ticket not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find and remove the reply
    const replyIndex = ticket.replies.findIndex(reply => reply._id.toString() === replyId);
    
    if (replyIndex === -1) {
      return new Response(JSON.stringify({ 
        error: "Reply not found" 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    ticket.replies.splice(replyIndex, 1);
    await ticket.save();

    return new Response(JSON.stringify({
      message: "Reply deleted successfully"
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("DELETE /api/tickets/[id]/replies error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to delete reply" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}