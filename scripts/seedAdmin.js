/**
 * Seed Admin User Script
 * 
 * This script creates an initial admin user for the system.
 * Run this script once to create your first admin account.
 * 
 * Usage:
 * Update the admin credentials below, then run:
 * node scripts/seedAdmin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vimukthi:S5l4JFx2L4Qq7FCj@cluster0.bl7dx.mongodb.net/?appName=Cluster0';

// Admin User Credentials (CHANGE THESE!)
const ADMIN_USER = {
    name: 'System Administrator',
    email: 'admin@lakdhanvisolar.com',
    password: 'admin123456',
    role: 'admin',
    phone: '+94750569545',
};

// User Schema (simplified version)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function seedAdmin() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_USER.email });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists with email:', ADMIN_USER.email);
            console.log('ℹ️  If you want to reset the password, delete the user first from MongoDB');
            process.exit(0);
        }

        // Hash password
        console.log('🔐 Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_USER.password, salt);

        // Create admin user
        console.log('👤 Creating admin user...');
        const adminUser = await User.create({
            name: ADMIN_USER.name,
            email: ADMIN_USER.email,
            password: hashedPassword,
            role: ADMIN_USER.role,
            phone: ADMIN_USER.phone,
            isActive: true,
        });

        console.log('\n✅ Admin user created successfully!');
        console.log('\n📧 Login Credentials:');
        console.log('   Email:', ADMIN_USER.email);
        console.log('   Password:', ADMIN_USER.password);
        console.log('\n⚠️  IMPORTANT: Please change the password after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        process.exit(1);
    }
}

seedAdmin();
