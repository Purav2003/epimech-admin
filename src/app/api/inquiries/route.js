import dbConnect from '@/lib/dbConnect';
import Inquiry from '@/models/Inquiry';

export async function GET() {
  await dbConnect();
  const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
  return Response.json(inquiries);
}

export async function POST(req) {
  await dbConnect();
  const data = await req.json();
  const saved = await Inquiry.create(data);
  return Response.json(saved);
}
