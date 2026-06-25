require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = 'grafiqly.in@gmail.com';

async function promote() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found. Creating admin account...`);
      user = await User.create({
        email,
        name: 'Admin User',
        password: 'admin_temp_password_123', // Admin can change this later
        role: 'admin'
      });
      console.log(`✅ Success! Created new admin account for ${email}. (Temp password: admin_temp_password_123)`);
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`✅ Success! ${email} has been promoted to admin.`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

promote();
