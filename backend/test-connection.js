const mongoose = require('mongoose');
require('dotenv').config();

// Test MongoDB connection
async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
    console.log('JWT Secret:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('✅ Database accessible, collections:', collections.length);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('whitelist')) {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Go to MongoDB Atlas → Network Access');
      console.log('2. Add your IP address:', '171.79.45.57');
      console.log('3. Or temporarily allow all IPs: 0.0.0.0/0');
      console.log('4. Wait 2-3 minutes and try again');
    }
    
    process.exit(1);
  }
}

testConnection();
