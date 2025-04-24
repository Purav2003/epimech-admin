// create profile api route
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import {UserModel} from '@/models/User';
import bcrypt from 'bcryptjs';


export async function GET(request) {

    await dbConnect();
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = jwt.decode(token);
    console.log('Decoded token:', token,decoded);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = decoded?.userId;
    const user = await UserModel.find({ _id: userId });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({ user }, { status: 200 });
}


export async function PUT(request) {
    await dbConnect();
  
    try {
      const token = request.headers.get('Authorization')?.split(' ')[1];
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.username) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
      }
  
      const body = await request.json();
      const updates = {};
  
      // Handle username and email updates
      if (body.username) updates.username = body.username;
      if (body.email) updates.email = body.email;
  
      // Handle password update with bcrypt
      if (body.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);
        updates.password = hashedPassword;
      }
  
      const updatedUser = await UserModel.findOneAndUpdate(
        { username: decoded.username },
        { $set: updates },
        { new: true }
      );
  
      if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      return NextResponse.json({ user: updatedUser }, { status: 200 });
  
    } catch (err) {
      console.error('Profile update error:', err);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  }