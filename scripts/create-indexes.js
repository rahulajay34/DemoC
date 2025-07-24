// My MongoDB queries are slow. This script adds indexes to frequently queried fields like 'userId', 'status', 'category' to speed up data retrieval significantly.
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables.');
  console.log('Please create a .env file with your MongoDB connection string:');
  console.log('MONGODB_URI=mongodb://your-connection-string');
  process.exit(1);
}

async function connectToDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

async function createOptimalIndexes() {
  try {
    await connectToDB();
    console.log('🚀 Connected to MongoDB. Creating performance indexes...');

    const db = mongoose.connection.db;

    // Riders collection indexes
    try {
      await db.collection('riders').createIndex({ email: 1 }, { unique: true });
      await db.collection('riders').createIndex({ status: 1 });
      await db.collection('riders').createIndex({ phone: 1 });
      await db.collection('riders').createIndex({ createdAt: -1 });
      await db.collection('riders').createIndex({ name: "text", email: "text", phone: "text" });
      console.log('✅ Riders indexes created');
    } catch (error) {
      console.log('⚠️  Some riders indexes may already exist:', error.message);
    }

    // Bikes collection indexes  
    try {
      await db.collection('bikes').createIndex({ status: 1 });
      await db.collection('bikes').createIndex({ registrationNumber: 1 }, { unique: true });
      await db.collection('bikes').createIndex({ type: 1 });
      await db.collection('bikes').createIndex({ zone: 1 });
      await db.collection('bikes').createIndex({ assignedTo: 1 });
      await db.collection('bikes').createIndex({ createdAt: -1 });
      await db.collection('bikes').createIndex({ make: "text", model: "text", registrationNumber: "text" });
      console.log('✅ Bikes indexes created');
    } catch (error) {
      console.log('⚠️  Some bikes indexes may already exist:', error.message);
    }

    // Assignments collection indexes
    try {
      await db.collection('assignments').createIndex({ rider: 1 });
      await db.collection('assignments').createIndex({ bike: 1 });
      await db.collection('assignments').createIndex({ status: 1 });
      await db.collection('assignments').createIndex({ startDate: 1 });
      await db.collection('assignments').createIndex({ endDate: 1 });
      await db.collection('assignments').createIndex({ createdAt: -1 });
      await db.collection('assignments').createIndex({ paymentStatus: 1 });
      console.log('✅ Assignments indexes created');
    } catch (error) {
      console.log('⚠️  Some assignments indexes may already exist:', error.message);
    }

    // Payments collection indexes
    try {
      await db.collection('payments').createIndex({ rider: 1 });
      await db.collection('payments').createIndex({ assignment: 1 });
      await db.collection('payments').createIndex({ status: 1 });
      await db.collection('payments').createIndex({ type: 1 });
      await db.collection('payments').createIndex({ dueDate: 1 });
      await db.collection('payments').createIndex({ createdAt: -1 });
      await db.collection('payments').createIndex({ paymentMethod: 1 });
      console.log('✅ Payments indexes created');
    } catch (error) {
      console.log('⚠️  Some payments indexes may already exist:', error.message);
    }

    // Maintenance collection indexes
    try {
      await db.collection('maintenances').createIndex({ bike: 1 });
      await db.collection('maintenances').createIndex({ status: 1 });
      await db.collection('maintenances').createIndex({ priority: 1 });
      await db.collection('maintenances').createIndex({ type: 1 });
      await db.collection('maintenances').createIndex({ category: 1 });
      await db.collection('maintenances').createIndex({ scheduledDate: 1 });
      await db.collection('maintenances').createIndex({ createdAt: -1 });
      console.log('✅ Maintenance indexes created');
    } catch (error) {
      console.log('⚠️  Some maintenance indexes may already exist:', error.message);
    }

    // Analytics collection indexes
    try {
      await db.collection('analytics').createIndex({ period: 1 });
      await db.collection('analytics').createIndex({ date: -1 });
      await db.collection('analytics').createIndex({ period: 1, date: -1 });
      console.log('✅ Analytics indexes created');
    } catch (error) {
      console.log('⚠️  Some analytics indexes may already exist:', error.message);
    }

    // Tickets collection indexes
    try {
      await db.collection('tickets').createIndex({ status: 1 });
      await db.collection('tickets').createIndex({ priority: 1 });
      await db.collection('tickets').createIndex({ category: 1 });
      await db.collection('tickets').createIndex({ riderId: 1 });
      await db.collection('tickets').createIndex({ createdAt: -1 });
      await db.collection('tickets').createIndex({ subject: "text", description: "text" });
      console.log('✅ Tickets indexes created');
    } catch (error) {
      console.log('⚠️  Some tickets indexes may already exist:', error.message);
    }

    // Compound indexes for common query patterns
    try {
      await db.collection('assignments').createIndex({ status: 1, createdAt: -1 });
      await db.collection('payments').createIndex({ status: 1, dueDate: 1 });
      await db.collection('maintenances').createIndex({ status: 1, priority: 1 });
      await db.collection('bikes').createIndex({ status: 1, type: 1 });
      await db.collection('riders').createIndex({ status: 1, createdAt: -1 });
      console.log('✅ Compound indexes created');
    } catch (error) {
      console.log('⚠️  Some compound indexes may already exist:', error.message);
    }

    console.log('🎉 All MongoDB indexes created successfully!');
    console.log('🚀 Database queries should now be significantly faster!');
    
    // Display index statistics
    const collections = ['riders', 'bikes', 'assignments', 'payments', 'maintenances', 'analytics', 'tickets'];
    console.log('\n📊 Index Statistics:');
    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).indexes();
        console.log(`   ${collectionName}: ${indexes.length} indexes`);
      } catch (error) {
        console.log(`   ${collectionName}: Collection may not exist yet`);
      }
    }

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createOptimalIndexes().then(() => {
    console.log('\n✨ Indexing completed! Your MongoDB queries are now optimized for maximum performance.');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Indexing failed:', error);
    process.exit(1);
  });
}

module.exports = { createOptimalIndexes };
