# Development Setup

This document explains how to run the frontend with your ESP32 device.

## Development with ESP32 Device

Use this to develop with your actual ESP32 device:

```bash
pnpm run dev
```

**Features:**

- API requests are automatically proxied to your ESP32 device
- Real temperature data from ESP32 sensors
- Real WiFi scanning and connection
- Hot reloading for development

**Configuration:**

- Update the ESP32 IP address in `esp32-config.js` if needed
- Make sure your ESP32 is running and accessible at the configured IP

## API Endpoints

When using ESP32 mode, the following endpoints are available:

- `GET /api/v1/system/info` - System information
- `GET /api/v1/temp/current` - Current temperature data
- `POST /api/v1/temp/target` - Set target temperatures
- `GET /api/v1/wifi/scan` - Scan for WiFi networks
- `GET /api/v1/wifi/station` - Current WiFi station info
- `POST /api/v1/wifi/credentials` - Set WiFi credentials

## Testing Your Setup

Before starting development, test your ESP32 connection:

```bash
pnpm run test:esp32
```

This will verify that your ESP32 is responding to API requests.

## Troubleshooting

### ESP32 Not Found

- Check that your ESP32 is running and accessible
- Verify the IP address in `esp32-config.js`
- Ensure both devices are on the same network
- Run the connection test script

### CORS Issues

- The ESP32 server should handle CORS headers
- Check browser developer tools for network errors

### API Timeouts

- ESP32 might be busy or not responding
- Check ESP32 serial output for errors
- Try refreshing the page

## Production Build

For production deployment:

```bash
pnpm run build
```

This creates a static export in the `dist` folder that can be served by any web server.
