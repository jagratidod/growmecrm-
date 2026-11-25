import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';

async function createAdmin() {
  const email = process.env.GROWME_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.GROWME_ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12) {
    throw new Error('Set GROWME_ADMIN_EMAIL and a GROWME_ADMIN_PASSWORD of at least 12 characters.');
  }
  await connectDB();
  try {
    await User.create({ email, name: 'GrowMe Admin', password: await bcrypt.hash(password, 12), role: 'SUPER_ADMIN' });
    console.log('GrowMe Super Admin created.');
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin().catch((error: Error & { code?: number }) => {
  console.error(error.code === 11000 ? 'This email is already registered.' : error.message);
  process.exitCode = 1;
});
