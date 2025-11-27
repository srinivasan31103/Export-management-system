import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('=== Authentication Flow Test ===\n');

    // Step 1: Login
    console.log('1. Login as admin...');
    const loginResp = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@exportsuite.com',
      password: 'admin123'
    });

    if (loginResp.data.success) {
      console.log('   ✓ Login successful');
      const token = loginResp.data.data.token;
      console.log(`   Token: ${token.substring(0, 50)}...`);

      // Step 2: Test /auth/me
      console.log('\n2. Test /auth/me endpoint...');
      const meResp = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (meResp.data.success) {
        console.log('   ✓ Auth successful');
        console.log(`   User: ${meResp.data.data.name} (${meResp.data.data.role})`);
        console.log('\n✅ All tests passed! Authentication working correctly.');
      } else {
        console.log('   ✗ Auth failed');
        console.log('   Response:', meResp.data);
      }
    } else {
      console.log('   ✗ Login failed');
      console.log('   Response:', loginResp.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();
