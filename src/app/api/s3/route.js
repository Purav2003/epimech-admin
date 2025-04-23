import mongoose from 'mongoose';
import Product from '@/models/OtherParts'; // your Mongoose model
export async function GET(req) {
  const BASE_URL = 'https://epimech.s3.us-east-2.amazonaws.com/otherParts/'; // your S3 bucket URL
  
   if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      }
  const products = await Product.find({});
  console.log('Products:', products); // Log the products to check if they are fetched correctly
  for (let product of products) {
    if (product.image) {
      const filename = product.image.replace('uploads/', '');
      product.image = BASE_URL + filename;
      await product.save();
    }
  }
  
  console.log('✅ Updated all image paths!');
  
  return new Response('Image paths updated successfully', { status: 200 });
}
