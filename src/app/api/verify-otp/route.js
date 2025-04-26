import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UserModel } from '@/models/User';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    const { username, otp } = await req.json();
    const user = await UserModel.findOne({ username, tempOTP: otp });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 401 });
    }

    // Clear OTP
    user.tempOTP = undefined;
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1y' }
    );

    // Create a response and set the cookie properly
    const response = new NextResponse(JSON.stringify({ success: true,token:token }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
