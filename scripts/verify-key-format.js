#!/usr/bin/env node

const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.4Vj2qZbGnzDNwJxw';

// Parse JWT parts
const [header, payload, signature] = serviceKey.split('.');
console.log('JWT Analysis:');
console.log('-----------------');

try {
  const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString());
  console.log('Header:', decodedHeader);

  const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
  console.log('Payload:', decodedPayload);

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  console.log('\nExpiration Check:');
  console.log('Current time:', new Date(now * 1000).toISOString());
  console.log('Token expires:', new Date(decodedPayload.exp * 1000).toISOString());
  console.log('Is expired:', decodedPayload.exp < now);

  // Check format
  console.log('\nFormat Check:');
  console.log('Has correct issuer:', decodedPayload.iss === 'supabase');
  console.log('Has correct role:', decodedPayload.role === 'service_role');
  console.log('Has project ref:', Boolean(decodedPayload.ref));
  
  // Length check (service role keys are typically longer)
  console.log('\nLength Check:');
  console.log('Key length:', serviceKey.length, 'characters');
  console.log('Expected minimum:', 160, 'characters');
} catch (err) {
  console.error('Failed to parse JWT:', err.message);
}
