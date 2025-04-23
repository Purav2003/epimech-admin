import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const filename = searchParams.get('filename');
    const filetype = searchParams.get('filetype');
    const category = searchParams.get('category')?.toLowerCase();


    if (!filename || !filetype) {
      return new Response(JSON.stringify({ error: 'Missing filename or filetype' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    let key = filename;
    if (category === 'otherparts') {
      key = `otherParts/${filename}`;
    }


    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: filetype,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return new Response(JSON.stringify({ url: signedUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("Error generating signed URL:", err);
    return new Response(JSON.stringify({ error: 'Failed to generate URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
