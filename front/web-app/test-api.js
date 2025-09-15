const http = require('http');

// Test the WiFi scan API endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/wifi-scan',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing WiFi scan API endpoint...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
