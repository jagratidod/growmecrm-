import { intakeKey, saveIncomingLead } from '../services/leadIntake';
import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Lead, ILead, leadStages } from '../models/Lead';
import { FilterQuery, SortOrder, Types, isValidObjectId } from 'mongoose';
import { FollowUp } from '../models/FollowUp';
import { Booking } from '../models/Booking';
import { workspaceAccess } from '../platform/access';
import { leadStageUpdate } from '../services/leadLifecycle';
import { User } from '../models/User';
import { leadsRemaining, leadQuotaMessage } from '../utils/quota';

// Helper to format Mongoose document to frontend-compatible Lead object
const formatLead = (doc: ILead) => {
  const obj = doc.toObject();
  return {
    ...obj,
    temperature: ['Won', 'Lost'].includes(obj.temperature) ? 'Warm' : obj.temperature,
    id: doc._id.toString(),
    _id: undefined,
    activities: (doc.activities || []).map((activity, index) => ({
      id: activity._id?.toString() || `${doc._id}-activity-${index}`,
      type: activity.type || 'note_added',
      description: activity.description || '',
      author: activity.author || '',
      fromStage: activity.fromStage,
      toStage: activity.toStage,
      timestamp: activity.timestamp instanceof Date ? activity.timestamp.toISOString() : activity.timestamp,
    })),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
};

const todayKey = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const literalRegex = (value: string) => new RegExp(value.slice(0, 200).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
const pageNumber = (value: unknown, fallback: number, max: number) => Math.min(max, Math.max(1, Number.parseInt(text(value), 10) || fallback));

async function assignee(organizationId: string | undefined, id: unknown, name: unknown) {
  if (!id && (!name || name === 'Unassigned')) return { assignedTo: 'Unassigned', assignedUserId: undefined };
  const identity = id && isValidObjectId(id) ? { _id: id } : !id && text(name) ? { name: text(name) } : null;
  if (!identity) return null;
  const users = await User.find({ ...identity, organizationId, status: 'Active' }).select('name').limit(2).lean();
  return users.length === 1 ? { assignedTo: users[0].name, assignedUserId: users[0]._id } : null;
}

export const getLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.organizationId) { res.status(401).json({ error: 'Tenant context missing.' }); return; }
    const organizationId = new Types.ObjectId(req.user.organizationId);
    const q = req.query;
    const active = { organizationId, archivedAt: null };
    const query: FilterQuery<ILead> = {
      organizationId, archivedAt: q.view === 'archived' ? { $ne: null } : null,
    };
    const conditions: FilterQuery<ILead>[] = [];
    if (text(q.stage) && q.stage !== 'All') query.status = text(q.stage);
    if (text(q.source) && q.source !== 'All') query.source = text(q.source);
    if (text(q.customerType) && q.customerType !== 'All') query.customerType = text(q.customerType);
    if (text(q.temperature) && q.temperature !== 'All') {
      query.temperature = q.temperature === 'Warm' ? { $in: ['Warm', 'Won', 'Lost'] } : text(q.temperature);
    }
    if (text(q.destination)) query.destination = literalRegex(text(q.destination));
    if (text(q.assignedTo) && q.assignedTo !== 'All') {
      if (isValidObjectId(q.assignedTo)) {
        const member = await User.findOne({ organizationId, _id: q.assignedTo }).select('name').lean();
        const sameName = member ? await User.countDocuments({ organizationId, name: member.name }) : 0;
        conditions.push({ $or: [
          { assignedUserId: q.assignedTo },
          ...(member && sameName === 1 ? [{ assignedUserId: null, assignedTo: member.name }] : []),
        ] });
      } else query.assignedTo = text(q.assignedTo);
    }
    if (q.view === 'mine') conditions.push({ $or: [
      { assignedUserId: req.user?.userId },
      { assignedUserId: null, assignedTo: { $in: [req.user?.name, req.user?.email?.split('@')[0]].filter(Boolean) } },
    ] });
    if (q.view === 'unassigned') conditions.push({ assignedUserId: null, assignedTo: { $in: ['Unassigned', '', null] } });
    if (text(q.search)) {
      const match = literalRegex(text(q.search));
      conditions.push({ $or: [{ name: match }, { email: match }, { phone: match }, { destination: match }, { interestedPackage: match }] });
    }

    const today = todayKey();
    if (q.view === 'due' || q.view === 'no-next-action') {
      if (!query.status) query.status = { $nin: ['Won', 'Lost'] };
      else if (['Won', 'Lost'].includes(String(query.status))) conditions.push({ status: { $nin: ['Won', 'Lost'] } });
      const pending = await FollowUp.distinct('leadId', {
        organizationId, status: { $ne: 'completed' }, leadId: { $ne: null },
        ...(q.view === 'due' ? { dueDate: { $lte: today } } : {}),
      });
      query._id = q.view === 'due' ? { $in: pending } : { $nin: pending };
    }
    if (conditions.length) query.$and = conditions;
    if (q.picker === '1') {
      const leads = await Lead.find(query).select('name phone destination').sort({ createdAt: -1, _id: -1 }).limit(20).lean();
      res.json({ leads: leads.map(({ _id, ...lead }) => ({ ...lead, id: String(_id) })) });
      return;
    }

    const paged = typeof q.page === 'string';
    const limit = pageNumber(q.limit, 10, 100);
    const page = pageNumber(q.page, 1, 100_000);
    const sortFields = ['createdAt', 'name', 'destination', 'budget', 'status', 'source', 'travelDate', 'assignedTo', 'temperature', 'travelers', 'customerType'];
    const sortField = sortFields.includes(text(q.sort)) ? text(q.sort) : 'createdAt';
    const sort: Record<string, SortOrder> = { [sortField]: q.direction === 'asc' ? 1 : -1, _id: -1 };
    const todayStart = new Date(`${today}T00:00:00+05:30`);
    const [grouped, todayCount, total] = await Promise.all([
      Lead.aggregate<{ _id: string; count: number }>([{ $match: active }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.countDocuments({ ...active, createdAt: { $gte: todayStart } }),
      Lead.countDocuments(query),
    ]);
    const stages = Object.fromEntries(grouped.map(({ _id, count }) => [_id, count]));
    const overall = grouped.reduce((sum, row) => sum + row.count, 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const rows = Lead.find(query).sort(sort);
    if (paged) rows.select('-activities -notes').skip((currentPage - 1) * limit).limit(limit);
    const leads = await rows;
    const next = new Map<string, { dueDate: string; dueTime: string; title: string }>();
    if (paged && leads.length) {
      const tasks = await FollowUp.aggregate<{ _id: Types.ObjectId; dueDate: string; dueTime: string; title: string }>([
        { $match: { organizationId, leadId: { $in: leads.map((lead) => lead._id) }, status: { $ne: 'completed' } } },
        { $sort: { dueDate: 1, dueTime: 1, _id: 1 } },
        { $group: { _id: '$leadId', dueDate: { $first: '$dueDate' }, dueTime: { $first: '$dueTime' }, title: { $first: '$title' } } },
      ]);
      for (const { _id, ...task } of tasks) next.set(String(_id), task);
    }
    res.json({
      leads: leads.map((lead) => ({ ...formatLead(lead), nextAction: next.get(lead.id) })),
      stats: { overall, today: todayCount, converted: stages.Won || 0, open: overall - (stages.Won || 0) - (stages.Lost || 0), stages },
      pagination: { page: currentPage, total, totalPages },
    });
  } catch (error) {
    console.error('getLeads error:', error instanceof Error ? error.name : 'Unknown error');
    res.status(500).json({ error: 'Could not load leads.' });
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

    const access = await workspaceAccess(String(lead.organizationId));
    const bookings = access?.enabled.includes('bookings')
      ? await Booking.find({ organizationId: lead.organizationId, leadId: lead._id })
        .select('status totalAmount amountPaid currency destination departure').sort({ createdAt: -1 }).limit(10).lean()
      : [];
    res.json({ ...formatLead(lead), linkedBookings: bookings.map(({ _id, ...booking }) => ({ id: String(_id), ...booking })) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching lead' });
  }
};

// 3. CREATE NEW LEAD
export const createLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) { res.status(401).json({ error: 'Tenant context missing.' }); return; }
    const authorName = req.user?.email ? req.user.email.split('@')[0] : 'Agent';

    if (await leadsRemaining(organizationId) < 1) {
      res.status(403).json({ error: leadQuotaMessage });
      return;
    }

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
      assignedUserId,
      temperature,
      tags,
      notes,
    } = req.body;

    if (!name?.trim() || !phone?.trim() || !destination?.trim()) {
      res.status(400).json({ error: 'Lead name, phone, and destination are required.' });
      return;
    }

    const lostReason = text(req.body.lostReason).slice(0, 500);
    if (status === 'Lost' && !lostReason) { res.status(400).json({ error: 'Enter a reason for losing this lead.' }); return; }
    const owner = await assignee(organizationId, assignedUserId || (!assignedTo ? req.user?.userId : undefined), assignedTo);
    if (!owner) { res.status(400).json({ error: 'Select an active teammate in this workspace.' }); return; }
    const initialActivity = {
      type: 'created' as const,
      description: `Lead created manually via CRM.`,
      timestamp: new Date(),
      author: authorName,
    };

    const requestId = req.get('Idempotency-Key') || '';
    if (requestId.length > 128) { res.status(400).json({ error: 'Request ID is too long.' }); return; }
    const { lead: newLead, created } = await saveIncomingLead({
      organizationId: new Types.ObjectId(organizationId),
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
      ...owner,
      temperature: ['Hot', 'Cold'].includes(temperature) ? temperature : 'Warm',
      stageChangedAt: new Date(),
      ...(['Won', 'Lost'].includes(status) ? { closedAt: new Date() } : {}),
      ...(status === 'Proposal sent' ? { proposalSentAt: new Date() } : {}),
      ...(status === 'Lost' ? { lostReason } : {}),
      tags: Array.isArray(tags) ? tags : [],
      notes: notes || '',
      activities: [initialActivity],
    }, requestId ? intakeKey('manual', requestId) : undefined);

    res.status(created ? 201 : 200).json(formatLead(newLead));
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

    const fields = ['name', 'email', 'phone', 'source', 'customerType', 'interestedPackage', 'destination', 'travelDate', 'travelers', 'budget', 'currency', 'temperature', 'tags', 'notes'];
    const updates = Object.fromEntries(fields.filter((key) => Object.hasOwn(req.body, key)).map((key) => [key, req.body[key]]));
    if (Object.hasOwn(updates, 'temperature') && !['Hot', 'Warm', 'Cold'].includes(updates.temperature)) {
      res.status(400).json({ error: 'Choose Hot, Warm or Cold.' }); return;
    }
    if (Object.hasOwn(req.body, 'assignedUserId') || Object.hasOwn(req.body, 'assignedTo')) {
      const owner = await assignee(req.user?.organizationId, req.body.assignedUserId, req.body.assignedTo);
      if (!owner) { res.status(400).json({ error: 'Select an active teammate in this workspace.' }); return; }
      lead.assignedTo = owner.assignedTo;
      lead.assignedUserId = owner.assignedUserId;
      lead.activities.unshift({ type: 'assigned', description: `Assigned to ${owner.assignedTo}`, author: req.user?.name || 'Agent', timestamp: new Date() });
    }
    lead.set(updates);
    await lead.save();

    res.status(200).json(formatLead(lead));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating lead' });
  }
};

export const changeLeadStage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { newStage } = req.body;
  const reason = text(req.body.lostReason).slice(0, 500);
  if (!leadStages.includes(newStage) || (newStage === 'Lost' && !reason)) {
    res.status(400).json({ error: newStage === 'Lost' ? 'Enter a reason for losing this lead.' : 'Choose a valid lead stage.' });
    return;
  }
  try {
    const identity = { _id: req.params.id, organizationId: req.user?.organizationId, archivedAt: null };
    const lead = await Lead.findOne(identity);
    if (!lead) { res.status(404).json({ error: 'Active lead not found.' }); return; }
    if (lead.status === newStage) { res.json(formatLead(lead)); return; }
    const updated = await Lead.findOneAndUpdate({ ...identity, status: lead.status },
      leadStageUpdate(lead, newStage, req.user?.name || 'Agent', reason), { new: true, runValidators: true });
    if (!updated) { res.status(409).json({ error: 'Another update changed this lead. Refresh and try again.' }); return; }
    res.json(formatLead(updated));
  } catch (error) {
    res.status(500).json({ error: 'Could not change the lead stage.' });
  }
};

// 6. ADD LEAD ACTIVITY (Note, Call, Email, WhatsApp)
export const addLeadActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, description } = req.body;
    if (type && !['note_added', 'call', 'email', 'whatsapp'].includes(type)) {
      res.status(400).json({ error: 'Choose a valid activity type.' }); return;
    }
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

    const authorName = req.user?.name || 'Agent';

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

export const importLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads) || !leads.length || leads.length > 500) {
      res.status(400).json({ error: 'Include 1–500 leads per import.' }); return;
    }
    const id = req.user?.organizationId;
    if (!id) { res.status(401).json({ error: 'Tenant context missing.' }); return; }
    const organizationId = new Types.ObjectId(id);

    const remaining = await leadsRemaining(organizationId);
    if (leads.length > remaining) {
      res.status(403).json({ error: `${leadQuotaMessage} You can import ${remaining} more lead(s).` });
      return;
    }

    const now = new Date();
    const author = req.user?.name || 'Importer';
    const batchKey = intakeKey('csv', JSON.stringify(leads));
    const result = { count: 0, skipped: 0, errors: [] as { row: number; message: string }[] };
    for (const [index, item] of leads.entries()) {
      try {
        if (item?.parseError) throw new Error('This record has the wrong number of columns.');
        const name = text(item?.name);
        const phone = text(item?.phone);
        if (!name || phone.replace(/\D/g, '').length < 7) throw new Error('Name and a valid phone are required.');
        const status = item.status || 'New';
        if (!leadStages.includes(status)) throw new Error('Choose a valid stage.');
        const lostReason = text(item.lostReason).slice(0, 500);
        if (status === 'Lost' && !lostReason) throw new Error('Lost leads need a reason.');
        const budget = item.budget === '' || item.budget == null ? undefined : Number(item.budget);
        if (budget !== undefined && (!Number.isFinite(budget) || budget < 0)) throw new Error('Budget must be a non-negative number.');
        const travelers = item.travelers === '' || item.travelers == null ? undefined : Number(item.travelers);
        if (travelers !== undefined && (!Number.isInteger(travelers) || travelers < 1)) throw new Error('Travelers must be a positive whole number.');
        const { created } = await saveIncomingLead({
          organizationId, name, phone, email: text(item.email) || undefined,
          source: 'CSV', status, customerType: item.customerType || 'B2C', destination: text(item.destination) || 'Unspecified',
          budget, travelers, currency: text(item.currency) || 'INR', temperature: ['Hot', 'Cold'].includes(item.temperature) ? item.temperature : 'Warm',
          stageChangedAt: now, ...(['Won', 'Lost'].includes(status) ? { closedAt: now } : {}),
          ...(status === 'Lost' ? { lostReason } : {}),
          ...(status === 'Proposal sent' ? { proposalSentAt: now } : {}),
          activities: [{ type: 'created', description: 'Imported via CSV.', timestamp: now, author }],
        }, `${batchKey}:${index}`);
        if (created) result.count++;
        else result.skipped++;
      } catch (error) {
        result.errors.push({ row: Number.isInteger(item?.rowNumber) ? item.rowNumber : index + 2,
          message: error instanceof Error && error.name !== 'MongoServerError' ? error.message : 'Could not save row.' });
      }
    }
    res.status(result.count ? 201 : 200).json(result);
  } catch (error: any) {
    console.error('importLeads error:', error);
    res.status(500).json({ error: error.message || 'Could not import leads.' });
  }
};

export const setLeadArchived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.method !== 'DELETE' && typeof req.body.archived !== 'boolean') {
    res.status(400).json({ error: 'Choose whether to archive this lead.' }); return;
  }
  const archived = req.method === 'DELETE' || req.body.archived === true;
  const identity = { _id: req.params.id, organizationId: req.user?.organizationId };
  try {
    const lead = await Lead.findOneAndUpdate({ ...identity, archivedAt: archived ? null : { $ne: null } }, {
      ...(archived ? { $set: { archivedAt: new Date() } } : { $unset: { archivedAt: 1 } }),
      $push: { activities: { $each: [{ type: 'note_added', description: archived ? 'Lead archived.' : 'Lead restored.',
        timestamp: new Date(), author: req.user?.name || 'Agent' }], $position: 0 } },
    }, { new: true }) || await Lead.findOne(identity);
    if (!lead) { res.status(404).json({ error: 'Lead not found.' }); return; }
    res.json({ ...formatLead(lead), message: archived ? 'Lead archived.' : 'Lead restored.' });
  } catch {
    res.status(500).json({ error: 'Could not update archive status.' });
  }
};
