import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';
import { User } from '../models/User.js';

// Function to connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Test login functionality
const testLogin = async () => {
  try {
    console.log('🔍 Testing login functionality...\n');
    
    // Test 1: Check if creator user exists
    console.log('1. Checking if creator user exists...');
    const creatorUser = await User.findOne({ email: 'creator@clipchain.com' });
    
    if (!creatorUser) {
      console.log('❌ Creator user not found!');
      console.log('   This means the database seeding didn\'t work properly.');
      console.log('   Please run: node seedDatabase.js');
      return;
    }
    
    console.log('✅ Creator user found:');
    console.log(`   Username: ${creatorUser.username}`);
    console.log(`   Email: ${creatorUser.email}`);
    console.log(`   Display Name: ${creatorUser.displayName}`);
    console.log(`   Is Verified: ${creatorUser.isVerified}`);
    console.log(`   Created: ${creatorUser.createdAt}`);
    console.log('');
    
    // Test 2: Check password hash
    console.log('2. Checking password hash...');
    console.log(`   Password field length: ${creatorUser.password.length}`);
    console.log(`   Password starts with: ${creatorUser.password.substring(0, 10)}...`);
    console.log('');
    
    // Test 3: Test password comparison
    console.log('3. Testing password comparison...');
    const testPassword = 'creator123';
    const isPasswordValid = await creatorUser.comparePassword(testPassword);
    
    if (isPasswordValid) {
      console.log('✅ Password comparison successful!');
    } else {
      console.log('❌ Password comparison failed!');
      console.log('   This means the password hash is incorrect.');
    }
    console.log('');
    
    // Test 4: Test findByUsernameOrEmail method
    console.log('4. Testing findByUsernameOrEmail method...');
    const userByEmail = await User.findByUsernameOrEmail('creator@clipchain.com');
    const userByUsername = await User.findByUsernameOrEmail('content_creator');
    
    if (userByEmail && userByUsername) {
      console.log('✅ findByUsernameOrEmail working correctly');
      console.log(`   Found by email: ${userByEmail.username}`);
      console.log(`   Found by username: ${userByUsername.username}`);
    } else {
      console.log('❌ findByUsernameOrEmail not working correctly');
    }
    console.log('');
    
    // Test 5: Simulate login process
    console.log('5. Simulating login process...');
    const loginUsername = 'creator@clipchain.com';
    const loginPassword = 'creator123';
    
    const user = await User.findByUsernameOrEmail(loginUsername);
    if (!user) {
      console.log('❌ User not found during login simulation');
      return;
    }
    
    const passwordValid = await user.comparePassword(loginPassword);
    if (!passwordValid) {
      console.log('❌ Password invalid during login simulation');
      return;
    }
    
    console.log('✅ Login simulation successful!');
    console.log('   User can be found and password is valid');
    console.log('');
    
    // Test 6: List all users in database
    console.log('6. Listing all users in database...');
    const allUsers = await User.find({}).select('username email displayName isVerified createdAt');
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database!');
      console.log('   Please run: node seedDatabase.js');
    } else {
      console.log(`✅ Found ${allUsers.length} users:`);
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} (${user.email}) - Verified: ${user.isVerified}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await testLogin();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testLogin };
