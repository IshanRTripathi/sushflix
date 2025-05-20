import { Document, Model, model, Schema, Types } from 'mongoose';

// Interface for the FeaturedProfile document
export interface IFeaturedProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  displayOrder: number;
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the FeaturedProfile model with static methods
interface IFeaturedProfileModel extends Model<IFeaturedProfile> {
  // Add any static methods here if needed
}

const FeaturedProfileSchema = new Schema<IFeaturedProfile, IFeaturedProfileModel>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  displayOrder: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'featuredProfiles'
});

// Pre-save hook to update lastUpdated
FeaturedProfileSchema.pre<IFeaturedProfile>('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Create and export the model
const FeaturedProfile: IFeaturedProfileModel = model<IFeaturedProfile, IFeaturedProfileModel>(
  'FeaturedProfile',
  FeaturedProfileSchema
);

export default FeaturedProfile;
