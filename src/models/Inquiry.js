import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema({
  type: { type: String, enum: ['PRODUCT', 'CONTACT-US'], required: true },
  name: String,
  email: String,
  country: String,
  product_number: String,
  quantity: String,
  comment: String,
  phone: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
