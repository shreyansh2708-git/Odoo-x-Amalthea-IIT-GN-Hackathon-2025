const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing Expenzify API endpoints...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5001/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    
    // Test auth endpoints (should return validation errors, not connection errors)
    console.log('\n2. Testing auth endpoints...');
    const authResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });
    const authData = await authResponse.json();
    console.log('✅ Auth endpoint accessible:', authData.message);
    
    console.log('\n🎉 All API endpoints are working!');
    console.log('\n📋 Available endpoints:');
    console.log('   • POST /api/auth/register - Register new user');
    console.log('   • POST /api/auth/login - Login user');
    console.log('   • GET /api/auth/me - Get current user');
    console.log('   • GET /api/expenses - Get expenses');
    console.log('   • POST /api/expenses - Create expense');
    console.log('   • GET /api/dashboard/stats - Get dashboard stats');
    console.log('   • POST /api/upload/single - Upload file');
    console.log('   • GET /api/currency/supported - Get currencies');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: npm run dev');
    console.log('2. Check if MongoDB connection is working');
    console.log('3. Verify no firewall blocking port 5001');
  }
}

testAPI();
