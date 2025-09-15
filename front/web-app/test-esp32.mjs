// Test ESP32 connection
// Run with: node test-esp32.mjs
// This script tests the connection to your ESP32 device

const ESP32_IP = '192.168.1.117';

async function testESP32Connection() {
  console.log(`Testing connection to ESP32 at ${ESP32_IP}...\n`);

  try {
    // Test system info endpoint
    console.log('1. Testing system info...');
    const response = await fetch(`http://${ESP32_IP}/api/v1/system/info`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ ESP32 is responding!');
      console.log('System info:', data);
    } else {
      console.log('❌ ESP32 responded with error:', response.status);
    }

    // Test temperature data
    console.log('\n2. Testing temperature data...');
    const tempResponse = await fetch(`http://${ESP32_IP}/api/v1/temp/current`);
    if (tempResponse.ok) {
      const tempData = await tempResponse.json();
      console.log('✅ Temperature data received:', tempData);
    } else {
      console.log('❌ Temperature data failed:', tempResponse.status);
    }

    // Test WiFi station
    console.log('\n3. Testing WiFi station...');
    const stationResponse = await fetch(`http://${ESP32_IP}/api/v1/wifi/station`);
    if (stationResponse.ok) {
      const stationData = await stationResponse.json();
      console.log('✅ WiFi station info:', stationData);
    } else {
      console.log('❌ WiFi station failed:', stationResponse.status);
    }

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your ESP32 is running');
    console.log('2. Check that the IP address is correct in esp32-config.ts');
    console.log('3. Ensure both devices are on the same network');
    console.log('4. Check ESP32 serial output for errors');
  }
}

testESP32Connection();
