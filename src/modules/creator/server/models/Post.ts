import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  caption: string;
  mediaUrl: string;
  likes: number;
  comments: number;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema: Schema<IPost> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Post: Model<IPost> = mongoose.model<IPost>('Post', PostSchema);

export default Post;
