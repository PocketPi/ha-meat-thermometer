import { createServer } from 'http'
import { parse } from 'url'
import { join, extname } from 'path'
import { readFileSync, existsSync, statSync } from 'fs'
 
const port = parseInt(process.env.PORT || '3000', 10)
const distDir = join(process.cwd(), 'dist')
 
// MIME types for different file extensions
const mimeTypes: { [key: string]: string } = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
}
 
function getContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  return mimeTypes[ext] || 'text/plain'
}
 
function serveStaticFile(req: any, res: any, filePath: string) {
  try {
    if (!existsSync(filePath)) {
      return false
    }
 
    const stats = statSync(filePath)
    if (stats.isDirectory()) {
      return false
    }

    console.log('Serving file:', filePath)
 
    const content = readFileSync(filePath)
    const contentType = getContentType(filePath)
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', content.length)
    res.writeHead(200)
    res.end(content)
    return true
  } catch (error) {
    console.error('Error serving file:', error)
    return false
  }
}
 
createServer((req, res) => {
  const parsedUrl = parse(req.url || '/', true)
  let pathname = parsedUrl.pathname || '/'
  
  // Remove query string and hash
  pathname = pathname.split('?')[0].split('#')[0]
  
  console.log('Request:', req.method, pathname)
  
  // Handle API endpoints
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res, pathname)
    return
  }
  
  // Handle root path
  if (pathname === '/') {
    pathname = '/index.html'
  }
  
  // Try to serve the file
  const filePath = join(distDir, pathname)
  
  if (serveStaticFile(req, res, filePath)) {
    return
  }
  
  // Try with .html extension
  if (!pathname.endsWith('.html')) {
    const htmlPath = filePath + '.html'
    if (serveStaticFile(req, res, htmlPath)) {
      return
    }
  }
  
  // Try index.html for directories (this handles /settings -> /settings/index.html)
  const indexPath = join(filePath, 'index.html')
  if (serveStaticFile(req, res, indexPath)) {
    return
  }
  
  // 404 - serve index.html as fallback for SPA routing
  const fallbackPath = join(distDir, 'index.html')
  if (existsSync(fallbackPath)) {
    res.setHeader('Content-Type', 'text/html')
    res.writeHead(200)
    res.end(readFileSync(fallbackPath))
  } else {
    res.writeHead(404)
    res.end('File not found')
  }
}).listen(port)

function handleApiRequest(req: any, res: any, pathname: string) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  // Handle different API endpoints
  if (pathname === '/api/wifi-scan') {
    handleWifiScan(req, res)
  } else if (pathname === '/api/v1/wifi/scan') {
    handleWifiScan(req, res)
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'API endpoint not found' }))
  }
}

function handleWifiScan(req: any, res: any) {
  // Simulate some delay like a real scan would take
  setTimeout(() => {
    const mockNetworks = [
      {
        ssid: "MyHomeWiFi",
        rssi: -45,
        authmode: 3
      },
      {
        ssid: "NeighborWiFi",
        rssi: -65,
        authmode: 3
      },
      {
        ssid: "GuestNetwork",
        rssi: -70,
        authmode: 3
      },
      {
        ssid: "HiddenNetwork",
        rssi: -80,
        authmode: 3
      },
      {
        ssid: "OfficeWiFi",
        rssi: -55,
        authmode: 3
      }
    ]
    
    const response = {
      networks: mockNetworks,
      count: mockNetworks.length
    }
    
    res.setHeader('Content-Type', 'application/json')
    res.writeHead(200)
    res.end(JSON.stringify(response))
  }, 1000) // 1 second delay to simulate scanning
}
 
console.log(`> Static server listening at http://localhost:${port}`)
console.log(`> Serving static files from: ${distDir}`)
console.log(`> Make sure to run 'pnpm run build' first to generate static files`)