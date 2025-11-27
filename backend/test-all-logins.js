import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const credentials = [
  { email: 'admin@exportsuite.com', password: 'admin123', role: 'Admin' },
  { email: 'manager@exportsuite.com', password: 'manager123', role: 'Manager' },
  { email: 'clerk@exportsuite.com', password: 'clerk123', role: 'Clerk' },
  { email: 'buyer@importco.com', password: 'buyer123', role: 'Buyer' }
];

async function testAllLogins() {
  console.log('=== Testing All Login Credentials ===\n');

  for (const cred of credentials) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: cred.email,
        password: cred.password
      });

      if (response.data.success) {
        console.log(`✓ ${cred.role}: ${cred.email} / ${cred.password} - SUCCESS`);

        // Test /auth/me with the token
        const token = response.data.data.token;
        const meResp = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (meResp.data.success) {
          console.log(`  → Token valid, user: ${meResp.data.data.name}`);
        } else {
          console.log(`  → Token verification FAILED`);
        }
      } else {
        console.log(`✗ ${cred.role}: ${cred.email} / ${cred.password} - FAILED`);
      }
    } catch (error) {
      console.log(`✗ ${cred.role}: ${cred.email} / ${cred.password} - ERROR`);
      console.log(`  Error: ${error.response?.data?.error || error.message}`);
    }
    console.log('');
  }
}

testAllLogins();
