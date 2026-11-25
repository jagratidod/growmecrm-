import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { seedDefaultUsers } from '../config/seedDefaults';
import '../platform/models';

async function loadAllModels(): Promise<void> {
  const modelsDir = path.resolve(__dirname, '../models');
  for (const file of fs.readdirSync(modelsDir)) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(path.join(modelsDir, file));
    }
  }
}

async function resetDatabase(): Promise<void> {
  await connectDB();
  try {
    await loadAllModels();

    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection is not initialized.');

    await db.dropDatabase();
    console.log('Dropped existing database data.');

    const models = Object.values(mongoose.models);
    for (const model of models) {
      await model.createCollection();
      await model.init().catch((err: Error) => {
        console.warn(`Index init warning for ${model.modelName}: ${err.message}`);
      });
    }
    console.log(`Recreated ${models.length} collections.`);

    await seedDefaultUsers();
    console.log('Seeded 2 test accounts: user/user123 and admin/admin123.');
  } finally {
    await mongoose.disconnect();
  }
}

resetDatabase().catch((error: Error) => {
  console.error('Database reset failed:', error.message);
  process.exitCode = 1;
});
