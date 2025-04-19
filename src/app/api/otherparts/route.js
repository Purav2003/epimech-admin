import dbConnect from '@/lib/dbConnect';
import OtherParts from '@/models/OtherParts';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  const results = await OtherParts.find({
    is_hide: false,
    $or: [
      { part_name: { $regex: search, $options: 'i' } },
      { 'part_number.EMD 710 / EMD 645': { $regex: search, $options: 'i' } },
    ]
  }).sort({ rank: 1 });

  return Response.json(results);
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
//   check for duplicate part_name
    const duplicate = await OtherParts.findOne({ part_name: body.part_name });
    if (duplicate) {
        return new Response('Part name already exists', { status: 400 });
    }
    // check for duplicate part_number
    const duplicatePartNumber = await OtherParts.findOne({ 'part_number.EMD 710 / EMD 645': body['part_number.EMD 710 / EMD 645'] });
    if (duplicatePartNumber) {
        return new Response('Part number already exists', { status: 400 });
    }
    // check for duplicate rank
    const duplicateRank = await OtherParts.findOne({ rank: body.rank });
    if (duplicateRank) {
        return new Response('Rank already exists', { status: 400 });
    }
    const part = await OtherParts.create(body);

  return Response.json(part);
}
