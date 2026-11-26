import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { FollowUp, IFollowUp } from '../models/FollowUp';
import { Lead } from '../models/Lead';

// Helper to get local date in YYYY-MM-DD
const getTodayStr = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// Helper to format Mongoose document to frontend-compatible FollowUpItem
const formatFollowUp = (doc: IFollowUp) => {
  const obj = doc.toObject();
  return {
    ...obj,
    id: doc._id.toString(),
    _id: undefined,
    leadId: doc.leadId ? doc.leadId.toString() : '',
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
};

// 1. GET ALL FOLLOW-UPS (with filters, search, and calculated stats)
export const getFollowUps = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const todayStr = getTodayStr();

    const { filter = 'all', search } = req.query;
    const query: any = { organizationId };

    // Search filter
    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { leadName: searchRegex },
        { destination: searchRegex },
        { note: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Tab filter logic
    if (filter === 'completed') {
      query.status = 'completed';
    } else if (filter === 'overdue') {
      query.status = 'overdue';
    } else if (filter === 'today') {
      query.dueDate = todayStr;
      query.status = { $ne: 'completed' };
    } else if (filter === 'upcoming') {
      query.dueDate = { $gt: todayStr };
      query.status = { $ne: 'completed' };
    }

    const followUps = await FollowUp.find(query).sort({ dueDate: 1, dueTime: 1 });

    // Compute metric cards stats for the whole tenant organization
    const allTenantItems = await FollowUp.find({ organizationId });
    const stats = {
      total: allTenantItems.length,
      today: allTenantItems.filter((i) => i.dueDate === todayStr && i.status !== 'completed').length,
      overdue: allTenantItems.filter((i) => i.status === 'overdue' || (i.dueDate < todayStr && i.status !== 'completed')).length,
      completed: allTenantItems.filter((i) => i.status === 'completed').length,
    };

    res.status(200).json({
      followUps: followUps.map(formatFollowUp),
      stats,
    });
  } catch (error: any) {
    console.error('[Get FollowUps Error]:', error);
    res.status(500).json({ error: error.message || 'Error fetching follow-ups' });
  }
};

// 2. GET SINGLE FOLLOW-UP BY ID
export const getFollowUpById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { id } = req.params;

    const followUp = await FollowUp.findOne({ _id: id, organizationId });
    if (!followUp) {
      res.status(404).json({ error: 'Follow-up not found' });
      return;
    }

    res.status(200).json({ followUp: formatFollowUp(followUp) });
  } catch (error: any) {
    console.error('[Get FollowUp By ID Error]:', error);
    res.status(500).json({ error: error.message || 'Error fetching follow-up details' });
  }
};

// 3. CREATE NEW FOLLOW-UP
export const createFollowUp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.userId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const {
      leadId,
      title,
      leadName,
      phone,
      destination,
      dueDate,
      dueTime,
      type,
      assignedTo,
      assignedToName,
      note,
    } = req.body;

    const taskTitle = title?.trim() || leadName?.trim() || 'Follow-up Task';
    const finalLeadName = leadName?.trim() || taskTitle;
    const finalPhone = phone?.trim() || '';

    if (!dueDate?.trim()) {
      res.status(400).json({ error: 'Due date is required' });
      return;
    }

    const todayStr = getTodayStr();
    const isOverdue = dueDate < todayStr;

    // Create the follow-up
    const newFollowUp = await FollowUp.create({
      organizationId,
      createdBy: userId,
      leadId: leadId ? leadId : undefined,
      title: taskTitle,
      leadName: finalLeadName,
      phone: finalPhone,
      destination: destination?.trim() || '',
      dueDate: dueDate.trim(),
      dueTime: dueTime?.trim() || '10:00',
      type: ['call', 'whatsapp', 'email', 'meeting', 'follow-up'].includes(type) ? type : 'follow-up',
      assignedTo: assignedTo || undefined,
      assignedToName: assignedToName?.trim() || 'Unassigned',
      note: note?.trim() || '',
      status: isOverdue ? 'overdue' : 'pending',
    });

    // If linked to a lead in the CRM, record an activity timeline entry
    if (leadId) {
      try {
        await Lead.findOneAndUpdate(
          { _id: leadId, organizationId },
          {
            $push: {
              activities: {
                type: type === 'call' ? 'call' : type === 'whatsapp' ? 'whatsapp' : 'note_added',
                description: `Follow-up scheduled (${type.toUpperCase()}) for ${dueDate} at ${dueTime || '11:00 AM'}: ${note || 'No notes'}`,
                timestamp: new Date(),
                author: req.user?.name || 'Agent',
              },
            },
          }
        );
      } catch (actErr) {
        console.warn('[Activity Logging Warning]:', actErr);
      }
    }

    res.status(201).json({
      message: 'Follow-up task scheduled successfully',
      followUp: formatFollowUp(newFollowUp),
    });
  } catch (error: any) {
    console.error('[Create FollowUp Error]:', error);
    res.status(500).json({ error: error.message || 'Error scheduling follow-up' });
  }
};

// 4. UPDATE FOLLOW-UP
export const updateFollowUp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { id } = req.params;

    const followUp = await FollowUp.findOne({ _id: id, organizationId });
    if (!followUp) {
      res.status(404).json({ error: 'Follow-up not found or access denied' });
      return;
    }

    const {
      title,
      leadName,
      phone,
      destination,
      dueDate,
      dueTime,
      type,
      assignedTo,
      assignedToName,
      note,
      status,
    } = req.body;

    if (title !== undefined) followUp.title = title.trim();
    if (leadName !== undefined) followUp.leadName = leadName.trim();
    if (phone !== undefined) followUp.phone = phone.trim();
    if (destination !== undefined) followUp.destination = destination.trim();
    if (dueDate !== undefined) followUp.dueDate = dueDate.trim();
    if (dueTime !== undefined) followUp.dueTime = dueTime.trim();
    if (type !== undefined && ['call', 'whatsapp', 'email', 'meeting', 'follow-up'].includes(type)) {
      followUp.type = type;
    }
    if (assignedTo !== undefined) followUp.assignedTo = assignedTo;
    if (assignedToName !== undefined) followUp.assignedToName = assignedToName.trim();
    if (note !== undefined) followUp.note = note.trim();
    if (status !== undefined && ['pending', 'completed', 'overdue'].includes(status)) {
      followUp.status = status;
      if (status === 'completed') {
        followUp.completedAt = new Date();
        followUp.completedBy = req.user?.name || 'Agent';
      }
    }

    await followUp.save();

    res.status(200).json({
      message: 'Follow-up updated successfully',
      followUp: formatFollowUp(followUp),
    });
  } catch (error: any) {
    console.error('[Update FollowUp Error]:', error);
    res.status(500).json({ error: error.message || 'Error updating follow-up' });
  }
};

// 5. TOGGLE STATUS (Completed <-> Pending)
export const toggleFollowUpStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { id } = req.params;

    const followUp = await FollowUp.findOne({ _id: id, organizationId });
    if (!followUp) {
      res.status(404).json({ error: 'Follow-up not found' });
      return;
    }

    const isNowCompleted = followUp.status !== 'completed';
    const todayStr = getTodayStr();

    if (isNowCompleted) {
      followUp.status = 'completed';
      followUp.completedAt = new Date();
      followUp.completedBy = req.user?.name || 'Agent';
    } else {
      followUp.status = followUp.dueDate < todayStr ? 'overdue' : 'pending';
      followUp.completedAt = undefined;
      followUp.completedBy = undefined;
    }

    await followUp.save();

    // Log completion activity to linked lead timeline
    if (followUp.leadId && isNowCompleted) {
      try {
        await Lead.findOneAndUpdate(
          { _id: followUp.leadId, organizationId },
          {
            $push: {
              activities: {
                type: followUp.type === 'call' ? 'call' : followUp.type === 'whatsapp' ? 'whatsapp' : 'note_added',
                description: `Follow-up completed (${followUp.type.toUpperCase()}): ${followUp.note}`,
                timestamp: new Date(),
                author: req.user?.name || 'Agent',
              },
            },
          }
        );
      } catch (actErr) {
        console.warn('[Activity Logging Warning]:', actErr);
      }
    }

    res.status(200).json({
      message: `Follow-up marked as ${followUp.status}`,
      followUp: formatFollowUp(followUp),
    });
  } catch (error: any) {
    console.error('[Toggle FollowUp Status Error]:', error);
    res.status(500).json({ error: error.message || 'Error updating follow-up status' });
  }
};

// 6. DELETE FOLLOW-UP
export const deleteFollowUp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { id } = req.params;

    const result = await FollowUp.findOneAndDelete({ _id: id, organizationId });
    if (!result) {
      res.status(404).json({ error: 'Follow-up not found or already deleted' });
      return;
    }

    res.status(200).json({
      message: 'Follow-up removed successfully',
      id,
    });
  } catch (error: any) {
    console.error('[Delete FollowUp Error]:', error);
    res.status(500).json({ error: error.message || 'Error deleting follow-up' });
  }
};
