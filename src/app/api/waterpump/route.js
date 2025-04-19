import dbConnect from '@/lib/dbConnect';
import WaterPump from '@/models/WaterPump';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  const results = await WaterPump.find({
    is_hide: false,
    $or: [
      { part_name: { $regex: search, $options: 'i' } },
      { 'part_number.EMD 710 / EMD 645': { $regex: search, $options: 'i' } },
    ]
  }).sort({ rank: 1 });
  console.log('Results:', results); // Debugging line
  if (results.length === 0) {
    return Response.json({ message: 'No results found' }, { status: 404 });
  }
  return Response.json(results);
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const part = await WaterPump.create(body);
  return Response.json(part);
}
