import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the token cookie by setting it to expire immediately
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0), // Immediate expiration
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  // Also clear OTP cookie if needed
  response.cookies.set('otp', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
    sameSite: 'strict'
  });
  
  return response;
}