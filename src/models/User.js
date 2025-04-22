import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  tempOTP: {
    type: String,
    required: false
  },
  // Add other fields as needed
}, { timestamps: true });

// Set up TTL (Time To Live) index on tempOTP to automatically expire after 5 minutes
// This requires MongoDB 2.2+ and ensures OTPs are automatically invalidated
userSchema.index({ "updatedAt": 1 }, { expireAfterSeconds: 300, partialFilterExpression: { tempOTP: { $exists: true } } });

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);