import dbConnect from '@/lib/dbConnect';
import OtherParts from '@/models/OtherParts';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, message: 'Invalid data format' }, { status: 400 });
    }

    const updatePromises = items.map(({ id, rank }) =>
      OtherParts.findByIdAndUpdate(id, { rank })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating OtherParts ranks:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
