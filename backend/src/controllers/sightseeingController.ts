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

// 1. GET ALL SIGHTSEEING ACTIVITIES FOR TENANT
export const getActivities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
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
