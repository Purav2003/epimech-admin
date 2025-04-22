import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UserModel } from '@/models/User'; // Import your User model
import mongoose from 'mongoose';
export async function POST(req) {
  try {
        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        }
    
    const { username, otp } = await req.json();

    // Find user with matching username and OTP
    const user = await UserModel.findOne({ username, tempOTP: otp });

    if (user) {
      // Clear OTP after successful verification
      user.tempOTP = undefined;
      await user.save();

      // Create JWT
      const token = jwt.sign(
        { 
          userId: user._id,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = NextResponse.json({ success: true });

      // Set token in HTTP-only cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60, // 1 hour
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 401 });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}