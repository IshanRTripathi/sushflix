import { Schema, model, Document, Types } from 'mongoose';

export type MediaType = 'image' | 'video';

export interface IContent extends Document {
  title: string;
  description: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string;
  creator: Types.ObjectId;
  isExclusive: boolean;
  requiredLevel: 0 | 1 | 2 | 3;
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot be longer than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [2000, 'Description cannot be longer than 2000 characters']
    },
    mediaType: {
      type: String,
      enum: {
        values: ['image', 'video'],
        message: 'Media type must be either image or video'
      },
      required: [true, 'Media type is required']
    },
    mediaUrl: {
      type: String,
      required: [true, 'Media URL is required'],
      validate: {
        validator: (value: string) => {
          // Basic URL validation
          try {
            new URL(value);
            return true;
          } catch (e) {
            return false;
          }
        },
        message: 'Media URL must be a valid URL'
      }
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
      validate: {
        validator: (value: string) => {
          // Basic URL validation
          try {
            new URL(value);
            return true;
          } catch (e) {
            return false;
          }
        },
        message: 'Thumbnail URL must be a valid URL'
      }
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required']
    },
    isExclusive: {
      type: Boolean,
      default: false
    },
    requiredLevel: {
      type: Number,
      enum: {
        values: [0, 1, 2, 3],
        message: 'Required level must be between 0 and 3'
      },
      default: 0
    },
    likes: {
      type: Number,
      min: [0, 'Likes cannot be negative'],
      default: 0
    },
    views: {
      type: Number,
      min: [0, 'Views cannot be negative'],
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
ContentSchema.index({ creator: 1 });
ContentSchema.index({ isExclusive: 1 });
ContentSchema.index({ requiredLevel: 1 });
ContentSchema.index({ createdAt: -1 });

const Content = model<IContent>('Content', ContentSchema);

export default Content;