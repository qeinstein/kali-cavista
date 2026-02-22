// Test script to verify environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Environment Variables Test:');
console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set');
console.log('NEXT_PUBLIC_API_VERSION:', process.env.NEXT_PUBLIC_API_VERSION || 'Not set');

// Test the API config utility
const { getApiConfig, getAudioEndpoint, getRoutesEndpoint } = require('./src/utils/apiConfig.ts');

console.log('\nAPI Configuration:');
const config = getApiConfig();
console.log('Backend URL:', config.backendUrl);
console.log('API Version:', config.apiVersion);
console.log('Audio Endpoint:', config.audioEndpoint);
console.log('Routes Endpoint:', config.routesEndpoint);