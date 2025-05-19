import dbConnect from '@/lib/dbConnect';
import WaterPump from '@/models/WaterPump';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, message: 'Invalid data format' }, { status: 400 });
    }

    const updatePromises = items.map(({ id, rank }) => 
      WaterPump.findByIdAndUpdate(id, { rank })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating WaterPump ranks:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
