import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  const name = process.env.ADMIN_SEED_NAME || 'Admin';

  if (!email || !password) {
    console.error('ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set in .env before running this script.');
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`An account with email ${email} already exists (role: ${existing.role}). No admin created.`);
    process.exit(0);
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: 'admin',
    isApproved: true,
    isActive: true,
  });

  console.log(`Admin account created: ${admin.email}`);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});