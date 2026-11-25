import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { seedDefaultUsers } from '../config/seedDefaults';

async function run() {
  await connectDB();
  try {
    await seedDefaultUsers();
    console.log('Default users ready: user/user123 and admin/admin123');
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error: Error) => {
  console.error('Failed to seed default users:', error.message);
  process.exitCode = 1;
});
