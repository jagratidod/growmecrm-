import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Lead, ILead } from '../models/Lead';
import { User } from '../models/User';

// Helper to format Mongoose document to frontend-compatible Lead object
const formatLead = (doc: ILead) => {
  const obj = doc.toObject();
  return {
    ...obj,
    id: doc._id.toString(),
    _id: undefined,
    activities: (doc.activities || []).map((act: any) => ({
      ...act,
      id: act._id ? act._id.toString() : 'act-' + Math.random().toString(36).substring(2, 7),
      _id: undefined,
      timestamp: act.timestamp instanceof Date ? act.timestamp.toISOString() : act.timestamp,
    })),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
};

// 1. GET ALL LEADS WITH FILTERS & STATS
export const getLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const { search, stage, temperature, customerType, assignedTo, destination } = req.query;

    const query: any = { organizationId };

    if (stage && stage !== 'All') {
      query.status = stage;
    }

    if (temperature && temperature !== 'All') {
      query.temperature = temperature;
    }

    if (customerType && customerType !== 'All') {
      query.customerType = customerType;
    }

    if (assignedTo && assignedTo !== 'All') {
      query.assignedTo = assignedTo;
    }

    if (destination && typeof destination === 'string' && destination.trim()) {
      query.destination = { $regex: destination.trim(), $options: 'i' };
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } },
        { interestedPackage: { $regex: q, $options: 'i' } },
      ];
    }

    // Fetch leads sorted by newest first
    const leads = await Lead.find(query).sort({ createdAt: -1 });

    // Compute live stats for this organization
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [overallCount, todayCount, convertedCount] = await Promise.all([
      Lead.countDocuments({ organizationId }),
      Lead.countDocuments({ organizationId, createdAt: { $gte: todayStart } }),
      Lead.countDocuments({
        organizationId,
        $or: [{ status: 'Won' }, { temperature: 'Won' }],
      }),
    ]);

    res.status(200).json({
      leads: leads.map(formatLead),
      stats: {
        overall: overallCount,
        today: todayCount,
        converted: convertedCount,
      },
    });
  } catch (error: any) {
    console.error('getLeads error:', error);
    res.status(500).json({ error: error.message || 'Error fetching leads' });
  }
};

// 2. GET SINGLE LEAD
export const getLeadById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    res.status(200).json(formatLead(lead));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching lead' });
  }
};

// 3. CREATE NEW LEAD
export const createLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const authorName = req.user?.email ? req.user.email.split('@')[0] : 'Agent';

    const {
      name,
      email,
      phone,
      source,
      status,
      customerType,
      interestedPackage,
      destination,
      travelDate,
      travelers,
      budget,
      currency,
      assignedTo,
      temperature,
      tags,
      notes,
    } = req.body;

    if (!name?.trim() || !phone?.trim() || !destination?.trim()) {
      res.status(400).json({ error: 'Lead name, phone, and destination are required.' });
      return;
    }

    const initialActivity = {
      type: 'created' as const,
      description: `Lead created manually via CRM.`,
      timestamp: new Date(),
      author: authorName,
    };

    const newLead = await Lead.create({
      organizationId,
      name: name.trim(),
      email: email?.trim(),
      phone: phone.trim(),
      source: source || 'Manual',
      status: status || 'New',
      customerType: customerType || 'B2C',
      interestedPackage: interestedPackage?.trim(),
      destination: destination.trim(),
      travelDate,
      travelers: travelers ? Number(travelers) : 1,
      budget: budget ? Number(budget) : 0,
      currency: currency || 'INR',
      assignedTo: assignedTo || authorName,
      temperature: temperature || 'Warm',
      tags: Array.isArray(tags) ? tags : [],
      notes: notes || '',
      activities: [initialActivity],
    });

    res.status(201).json(formatLead(newLead));
  } catch (error: any) {
    console.error('createLead error:', error);
    res.status(500).json({ error: error.message || 'Error creating lead' });
  }
};

// 4. UPDATE LEAD DETAILS
export const updateLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const updates = req.body;
    delete updates._id;
    delete updates.id;
    delete updates.organizationId;
    delete updates.activities; // Activities managed via specific endpoints

    Object.assign(lead, updates);
    await lead.save();

    res.status(200).json(formatLead(lead));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating lead' });
  }
};

// 5. CHANGE LEAD STAGE (Kanban drag & drop)
export const changeLeadStage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { newStage } = req.body;
    if (!newStage) {
      res.status(400).json({ error: 'newStage is required' });
      return;
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const oldStage = lead.status;
    if (oldStage !== newStage) {
      const authorName = req.user?.email ? req.user.email.split('@')[0] : 'Agent';
      lead.status = newStage;

      if (newStage === 'Won') {
        lead.temperature = 'Won';
      } else if (newStage === 'Lost') {
        lead.temperature = 'Lost';
      }

      lead.activities.unshift({
        type: 'stage_changed',
        description: `Stage changed from ${oldStage} to ${newStage}`,
        timestamp: new Date(),
        author: authorName,
      });

      await lead.save();
    }

    res.status(200).json(formatLead(lead));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error changing lead stage' });
  }
};

// 6. ADD LEAD ACTIVITY (Note, Call, Email, WhatsApp)
export const addLeadActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, description, author } = req.body;
    if (!description?.trim()) {
      res.status(400).json({ error: 'Activity description is required' });
      return;
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const authorName = author || (req.user?.email ? req.user.email.split('@')[0] : 'Agent');

    lead.activities.unshift({
      type: type || 'note_added',
      description: description.trim(),
      timestamp: new Date(),
      author: authorName,
    });

    await lead.save();
    res.status(200).json(formatLead(lead));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error adding lead activity' });
  }
};

// 7. BULK IMPORT LEADS
export const importLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads) || leads.length === 0) {
      res.status(400).json({ error: 'An array of leads is required' });
      return;
    }

    const organizationId = req.user?.organizationId;
    const authorName = req.user?.email ? req.user.email.split('@')[0] : 'Importer';

    const docsToInsert = leads.map((item: any) => ({
      organizationId,
      name: item.name || 'Imported Lead',
      email: item.email,
      phone: item.phone || '+91 00000 00000',
      source: item.source || 'Manual',
      status: item.status || 'New',
      customerType: item.customerType || 'B2C',
      interestedPackage: item.interestedPackage,
      destination: item.destination || 'Not Specified',
      travelDate: item.travelDate,
      travelers: item.travelers ? Number(item.travelers) : 1,
      budget: item.budget ? Number(item.budget) : 0,
      currency: item.currency || 'INR',
      assignedTo: item.assignedTo || authorName,
      temperature: item.temperature || 'Warm',
      tags: Array.isArray(item.tags) ? item.tags : [],
      notes: item.notes || '',
      activities: [
        {
          type: 'created',
          description: 'Lead imported via CSV file.',
          timestamp: new Date(),
          author: authorName,
        },
      ],
    }));

    const inserted = await Lead.insertMany(docsToInsert);
    res.status(201).json({
      message: `${inserted.length} leads imported successfully`,
      count: inserted.length,
    });
  } catch (error: any) {
    console.error('importLeads error:', error);
    res.status(500).json({ error: error.message || 'Error importing leads' });
  }
};

// 8. DELETE LEAD
export const deleteLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await Lead.deleteOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Lead not found or already deleted' });
      return;
    }

    res.status(200).json({ message: 'Lead deleted successfully', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting lead' });
  }
};
