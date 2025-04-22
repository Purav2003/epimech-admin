// lib/otpStore.js

// Use a Map to store OTPs with username as the key
// This will work for a single server instance scenario
const otpStore = new Map();

// OTP expiry time (5 minutes in milliseconds)
const OTP_EXPIRY = 5 * 60 * 1000;

export function generateOTP(username) {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store the OTP with expiration time
  otpStore.set(username, {
    otp,
    expires: Date.now() + OTP_EXPIRY
  });
  
  // Set up automatic cleanup after expiry
  setTimeout(() => {
    if (otpStore.has(username)) {
      otpStore.delete(username);
    }
  }, OTP_EXPIRY);
  
  return otp;
}

export function verifyOTP(username, providedOTP) {
  const otpData = otpStore.get(username);
  
  console.log('OTP Data:', otpData); // Debugging line
  // Check if OTP exists and hasn't expired
  if (!otpData || Date.now() > otpData.expires) {
    return false;
  }
  
  // Check if OTP matches
  if (otpData.otp !== providedOTP) {
    return false;
  }
  
  // OTP is valid, delete it to prevent reuse
  otpStore.delete(username);
  
  return true;
}

export function clearOTP(username) {
  otpStore.delete(username);
}