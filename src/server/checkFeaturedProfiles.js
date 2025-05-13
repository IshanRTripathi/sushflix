const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const FeaturedProfile = require('./models/FeaturedProfile');
const User = require('./models/User');

async function checkFeaturedProfiles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all featured profiles
    const featuredProfiles = await FeaturedProfile.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();

    console.log(`Found ${featuredProfiles.length} featured profiles`);

    if (featuredProfiles.length > 0) {
      console.log('\nFeatured Profiles:');
      console.log('----------------');
      
      // Get user details for each featured profile
      for (const profile of featuredProfiles) {
        const user = await User.findById(profile.userId);
        console.log(`- User ID: ${profile.userId}`);
        console.log(`  Display Order: ${profile.displayOrder}`);
        console.log(`  Username: ${user?.username || 'Not found'}`);
        console.log(`  Display Name: ${user?.displayName || 'Not found'}`);
        console.log(`  Profile Picture: ${user?.profilePicture || 'Not found'}`);
        console.log('---');
      }
    } else {
      console.log('No featured profiles found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking featured profiles:', error);
    process.exit(1);
  }
}

checkFeaturedProfiles();
