import dbConnect from '@/lib/dbConnect';
import Waterpump from '@/models/WaterPump';
import OtherParts from '@/models/OtherParts';

const models = {
  waterpump: Waterpump,
  otherparts: OtherParts
};

export async function POST(req) {
  const { searchParams } = new URL(req.url, `http://${req.headers.get('host')}`);
  const category = searchParams.get('category')?.toLowerCase();

  if (!category || !models[category]) {
    return new Response(JSON.stringify({ error: 'Invalid or missing category' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await dbConnect();

    const Model = models[category];
    const body = await req.json();

    console.log('Received body:', body);

    const lastItem = await Model.findOne().sort({ rank: -1 });
    const newItem = new Model({
      ...body,
      rank: lastItem ? lastItem.rank + 1 : 1,
      is_hide: false
    });

    await newItem.save();

    return new Response(JSON.stringify(newItem), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Add product error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
