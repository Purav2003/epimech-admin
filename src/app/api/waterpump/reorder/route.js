import dbConnect from '@/lib/dbConnect';
import WaterPump from '@/models/WaterPump';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await dbConnect();
  const { items } = await request.json();

  for (const { id, rank } of items) {
    await WaterPump.findByIdAndUpdate(id, { rank });
  }

  return NextResponse.json({ success: true });
}
