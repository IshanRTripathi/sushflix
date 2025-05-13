const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log('Environment file path:', envPath);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '***' : 'Not found');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const FeaturedProfile = require('./models/FeaturedProfile');

const testUsers = [
  {
    username: 'testuser1',
    email: 'test1@example.com',
    password: 'password123',
    displayName: 'Test User 1',
    profilePicture: 'https://i.pravatar.cc/150?img=1',
    bio: 'Just a test user',
  },
  {
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'password123',
    displayName: 'Test User 2',
    profilePicture: 'https://i.pravatar.cc/150?img=2',
    bio: 'Another test user',
  },
  {
    username: 'testuser3',
    email: 'test3@example.com',
    password: 'password123',
    displayName: 'Test User 3',
    profilePicture: 'https://i.pravatar.cc/150?img=3',
    bio: 'Yet another test user',
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await FeaturedProfile.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords and create users
    const createdUsers = [];
    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new User({
        username: user.username,
        email: user.email,
        password: hashedPassword,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        bio: user.bio,
      });
      await newUser.save();
      createdUsers.push(newUser);
      console.log(`Created user: ${user.username}`);
    }

    // Feature the first two users
    const featuredUsers = createdUsers.slice(0, 2);
    for (let i = 0; i < featuredUsers.length; i++) {
      const user = featuredUsers[i];
      const featuredProfile = new FeaturedProfile({
        userId: user._id,
        displayOrder: i + 1,
        isActive: true,
      });
      await featuredProfile.save();
      console.log(`Featured user: ${user.username}`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
