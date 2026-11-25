import bcrypt from 'bcryptjs';
import { Organization } from '../models/Organization';
import { User } from '../models/User';

/**
 * Ensures default easy-login accounts (`user`/`user123` and `admin`/`admin123`)
 * exist in MongoDB for local testing and demo access.
 */
export async function seedDefaultUsers(): Promise<void> {
  let organization = await Organization.findOne({ slug: 'growme-demo' });
  if (!organization) {
    organization = await Organization.create({
      name: 'GrowMe Demo Agency',
      slug: 'growme-demo',
      plan: 'PRO',
      maxSeats: 10,
      maxLeads: 5000,
      status: 'ACTIVE',
    });
  }

  const userPasswordHash = await bcrypt.hash('user123', 10);
  await User.findOneAndUpdate(
    { email: 'user@growme.local' },
    {
      $set: {
        name: 'user',
        email: 'user@growme.local',
        password: userPasswordHash,
        role: 'OWNER',
        status: 'Active',
        organizationId: organization._id,
      },
    },
    { upsert: true, new: true }
  );

  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await User.findOneAndUpdate(
    { email: 'admin@growme.local' },
    {
      $set: {
        name: 'admin',
        email: 'admin@growme.local',
        password: adminPasswordHash,
        role: 'SUPER_ADMIN',
        status: 'Active',
      },
    },
    { upsert: true, new: true }
  );
}
