import dbConnect from '@/lib/dbConnect';
import OtherParts from '@/models/OtherParts';

export async function PUT(req, { params }) {
  await dbConnect();
  const body = await req.json();
  const updated = await OtherParts.findByIdAndUpdate(params.id, body, { new: true });
  return Response.json(updated);
}

export async function DELETE(req, { params }) {
  await dbConnect();
  await OtherParts.findByIdAndDelete(params.id);
  return new Response(null, { status: 204 });
}
