// app/api/images/route.js
import { S3 } from 'aws-sdk';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucket = process.env.AWS_S3_BUCKET_NAME;

// GET handler
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const prefix = category === 'otherParts' ? 'otherParts/' : '';

  try {
    const data = await s3
      .listObjectsV2({ Bucket: bucket, Prefix: prefix })
      .promise();

    const images = (data.Contents || []).map((item) => ({
      key: item.Key,
      url: s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: item.Key,
        Expires: 300, // 5 mins
      }),
    }));

    return Response.json(images);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch images' }), {
      status: 500,
    });
  }
}

// DELETE handler
export async function DELETE(request) {
  const body = await request.json();
  const { key } = body;

  if (!key) {
    return new Response(JSON.stringify({ error: 'Missing key' }), {
      status: 400,
    });
  }

  try {
    await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete image' }), {
      status: 500,
    });
  }
}
