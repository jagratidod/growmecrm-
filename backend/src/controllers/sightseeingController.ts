import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Sightseeing, ISightseeing } from '../models/Sightseeing';

// Format Mongoose document to frontend-compatible object
const formatSightseeing = (doc: ISightseeing) => {
  const obj = doc.toObject();
  return {
    ...obj,
    id: doc._id.toString(),
    _id: undefined,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
};

// Default seed activities for new tenant workspaces
const DEFAULT_SIGHTSEEING_SEEDS = [
  {
    name: 'Gulmarg Gondola & Snow Excursion',
    coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    description: 'Scenic mountain drive to Gulmarg. Take the world-famous Gondola Cable Car to Phase 1 & Phase 2 at Apharwat Peak for skiing, snowboarding, and panoramic Himalayan vistas.',
    destination: 'Kashmir',
    duration: 'Full Day (8 Hours)',
    tags: ['Adventure', 'Snow', 'Mountains'],
    isFavorite: true,
  },
  {
    name: 'Uluwatu Sunset Temple & Kecak Dance',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Visit the dramatic sea cliff temple of Uluwatu perched 70 meters above the Indian Ocean. Witness the mesmerizing traditional Balinese Kecak fire dance against a golden sunset.',
    destination: 'Bali',
    duration: 'Half Day (5 Hours)',
    tags: ['Culture', 'Sunset', 'Temple'],
    isFavorite: true,
  },
  {
    name: 'Nusa Penida Speedboat Island Tour',
    coverImage: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
    description: 'High-speed catamaran cruise to Nusa Penida island. Visit iconic Kelingking Beach (T-Rex cliff), Broken Beach natural bridge, Angel Billabong, and snorkel at Crystal Bay.',
    destination: 'Bali',
    duration: 'Full Day (10 Hours)',
    tags: ['Beach', 'Boat Tour', 'Island'],
    isFavorite: true,
  },
  {
    name: 'Dal Lake Shikara Ride & Floating Market',
    coverImage: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    description: 'Tranquil evening Shikara boat cruise on Srinagar’s jewel Dal Lake. Glide past floating lotus gardens, historic houseboats, and vibrant local floating bazaars.',
    destination: 'Kashmir',
    duration: '2 Hours',
    tags: ['Relaxation', 'Scenic', 'Romantic'],
    isFavorite: false,
  },
];

// 1. GET ALL SIGHTSEEING ACTIVITIES FOR TENANT
export const getActivities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    // Auto-seed default activities if collection is empty for this workspace
    const existingCount = await Sightseeing.countDocuments({ organizationId });
    if (existingCount === 0) {
      await Sightseeing.insertMany(
        DEFAULT_SIGHTSEEING_SEEDS.map((item) => ({
          ...item,
          organizationId: organizationId as any,
          createdBy: req.user?.userId as any,
        }))
      );
    }

    const { search } = req.query;
    const query: any = { organizationId };

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } },
      ];
    }

    const activities = await Sightseeing.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      activities: activities.map(formatSightseeing),
      total: activities.length,
    });
  } catch (error: any) {
    console.error('[Get Sightseeing Error]:', error);
    res.status(500).json({ error: error.message || 'Error fetching sightseeing activities' });
  }
};

// 2. GET SINGLE SIGHTSEEING ACTIVITY BY ID
export const getActivityById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { id } = req.params;

    const activity = await Sightseeing.findOne({ _id: id, organizationId });
    if (!activity) {
      res.status(404).json({ error: 'Sightseeing activity not found' });
      return;
    }

    res.status(200).json({ activity: formatSightseeing(activity) });
  } catch (error: any) {
    console.error('[Get Activity By ID Error]:', error);
    res.status(500).json({ error: error.message || 'Error fetching activity details' });
  }
};

// 3. CREATE NEW SIGHTSEEING ACTIVITY
export const createActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.userId;

    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const { name, coverImage, description, destination, duration, tags, isFavorite } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ error: 'Activity name is required' });
      return;
    }

    const newActivity = await Sightseeing.create({
      organizationId,
      createdBy: userId,
      name: name.trim(),
      coverImage: coverImage?.trim() || '',
      description: description?.trim() || '',
      destination: destination?.trim() || '',
      duration: duration?.trim() || '',
      tags: Array.isArray(tags) ? tags : [],
      isFavorite: !!isFavorite,
    });

    res.status(201).json({
      message: 'Sightseeing activity added to library successfully',
      activity: formatSightseeing(newActivity),
    });
  } catch (error: any) {
    console.error('[Create Activity Error]:', error);
    res.status(500).json({ error: error.message || 'Error creating sightseeing activity' });
  }
};

// 4. UPDATE SIGHTSEEING ACTIVITY
export const updateActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { id } = req.params;

    const activity = await Sightseeing.findOne({ _id: id, organizationId });
    if (!activity) {
      res.status(404).json({ error: 'Activity not found or access denied' });
      return;
    }

    const { name, coverImage, description, destination, duration, tags, isFavorite } = req.body;

    if (name !== undefined) activity.name = name.trim();
    if (coverImage !== undefined) activity.coverImage = coverImage.trim();
    if (description !== undefined) activity.description = description.trim();
    if (destination !== undefined) activity.destination = destination.trim();
    if (duration !== undefined) activity.duration = duration.trim();
    if (tags !== undefined && Array.isArray(tags)) activity.tags = tags;
    if (isFavorite !== undefined) activity.isFavorite = !!isFavorite;

    await activity.save();

    res.status(200).json({
      message: 'Sightseeing activity updated successfully',
      activity: formatSightseeing(activity),
    });
  } catch (error: any) {
    console.error('[Update Activity Error]:', error);
    res.status(500).json({ error: error.message || 'Error updating activity' });
  }
};

// 5. DELETE SIGHTSEEING ACTIVITY
export const deleteActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { id } = req.params;

    const result = await Sightseeing.findOneAndDelete({ _id: id, organizationId });
    if (!result) {
      res.status(404).json({ error: 'Activity not found or already deleted' });
      return;
    }

    res.status(200).json({
      message: 'Activity removed from library successfully',
      id,
    });
  } catch (error: any) {
    console.error('[Delete Activity Error]:', error);
    res.status(500).json({ error: error.message || 'Error deleting activity' });
  }
};

// 6. RE-SEED DEFAULT SIGHTSEEING FOR TENANT
export const seedActivities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    await Sightseeing.insertMany(
      DEFAULT_SIGHTSEEING_SEEDS.map((item) => ({
        ...item,
        organizationId: organizationId as any,
        createdBy: req.user?.userId as any,
      }))
    );

    const activities = await Sightseeing.find({ organizationId }).sort({ createdAt: -1 });

    res.status(201).json({
      message: `Seeded default sightseeing activities`,
      activities: activities.map(formatSightseeing),
    });
  } catch (error: any) {
    console.error('[Seed Activities Error]:', error);
    res.status(500).json({ error: error.message || 'Error seeding activities' });
  }
};
