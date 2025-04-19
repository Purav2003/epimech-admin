import dbConnect from '@/lib/dbConnect';
import WaterPump from '@/models/WaterPump';
import OtherParts from '@/models/OtherParts';
import { slugify } from '@/utils/slugify';

export async function GET(req, { params }) {
  await dbConnect();
  const slug = params.slug.toLowerCase();

  const [wp, op] = await Promise.all([
    WaterPump.find({}),
    OtherParts.find({})
  ]);

  const allParts = [...wp, ...op];
  const part = allParts.find(p => slugify(p.part_name) === slug);

  if (!part) return new Response('Part not found', { status: 404 });
  return Response.json(part);
}
