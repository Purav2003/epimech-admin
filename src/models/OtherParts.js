import mongoose from 'mongoose';

const PartSchema = new mongoose.Schema({
  image: String,
  is_hide: Boolean,
  rank: Number,
  part_name: String,
  part_number: Object,
  subimages: Object,
});

export default mongoose.models.OtherParts || mongoose.model('OtherParts', PartSchema);
