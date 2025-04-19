import mongoose from 'mongoose';

const PartSchema = new mongoose.Schema({
  image: String,
  is_hide: Boolean,
  rank: Number,
  part_name: String,
  part_number: Object,
});

export default mongoose.models.WaterPump || mongoose.model('WaterPump', PartSchema);
