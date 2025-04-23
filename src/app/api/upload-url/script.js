import mongoose from 'mongoose';
import Product from '@/models/OtherParts'; // your Mongoose model

const BASE_URL = 'https://epimech.s3.us-east-2.amazonaws.com/otherParts/'; // your S3 bucket URL

 if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
const products = await Product.find({});

for (let product of products) {
  if (product.image && product.image.startsWith('uploads/')) {
    const filename = product.image.replace('uploads/', '');
    product.image = BASE_URL + filename;
    await product.save();
  }
}

console.log('✅ Updated all image paths!');
process.exit();
