const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Next.js static export...');
execSync('pnpm run build', { stdio: 'inherit' });

console.log('Compiling static server...');
execSync('pnpm exec tsc server.ts --outDir dist --target es2020 --module commonjs --esModuleInterop --allowSyntheticDefaultImports', { stdio: 'inherit' });

console.log('Build complete!');
console.log('To run with custom static server: pnpm run start:server');
console.log('To run with Next.js static server: pnpm run start');
console.log('Note: Custom server will serve the static files from the dist directory');