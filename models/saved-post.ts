import mongoose, { Schema } from 'mongoose';

const savedPostSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  postUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for userId and postUrl to ensure uniqueness
savedPostSchema.index({ userId: 1, postUrl: 1 }, { unique: true });

export const SavedPost = mongoose.models.SavedPost || mongoose.model('SavedPost', savedPostSchema);