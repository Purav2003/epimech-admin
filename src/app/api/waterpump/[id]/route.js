import dbConnect from '@/lib/dbConnect';
import WaterPump from '@/models/WaterPump';

export async function PUT(req, { params }) {
  await dbConnect();
  const body = await req.json();
  const updated = await WaterPump.findByIdAndUpdate(params.id, body, { new: true });
  return Response.json(updated);
}

export async function DELETE(req, { params }) {
  await dbConnect();
  await WaterPump.findByIdAndDelete(params.id);
  return new Response(null, { status: 204 });
}
