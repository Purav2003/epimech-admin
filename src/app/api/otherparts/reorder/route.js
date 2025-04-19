import dbConnect from '@/lib/dbConnect';
import OtherParts from '@/models/OtherParts';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await dbConnect();
  const { items } = await request.json();

  for (const { id, rank } of items) {
    await OtherParts.findByIdAndUpdate(id, { rank });
  }

  return NextResponse.json({ success: true });
}
