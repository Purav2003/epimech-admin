import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendEmail';
import { UserModel } from '@/models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    const { username, password } = await req.json();

    // Find user in MongoDB
    const user = await UserModel.findOne({ username });

    // Check if user exists and password matches
    if (user && await bcrypt.compare(password, user.password)) {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP in user document temporarily
      user.tempOTP = otp;
      await user.save();

      // Send OTP via email
      await sendEmail({
        to: process.env.QUOTATION_RECIPIENT_EMAIL || user.email, // fallback to env or user's email
        subject: 'Your OTP Code',
        text: `Your login OTP is: ${otp}`,
      });

      return NextResponse.json({ success: true, otpSent: true });
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
