import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { CallLog, ICallLog } from '../models/CallLog';

const formatCallLog = (entry: ICallLog) => ({
  id: entry._id.toString(),
  leadId: entry.leadId || '',
  leadName: entry.leadName,
  leadPhone: entry.leadPhone,
  userName: entry.userName,
  outcome: entry.outcome,
  notes: entry.notes || '',
  durationSeconds: entry.durationSeconds || 0,
  createdAt: entry.createdAt ? new Date(entry.createdAt).toISOString() : new Date().toISOString(),
});

// 1. GET ALL CALL LOGS FOR LOGGED IN AGENCY
export const getCallLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    const { user, searchLead } = req.query;
    const filter: any = { organizationId: orgId };

    if (user && user !== 'All users') {
      filter.userName = { $regex: new RegExp(`^${user}$`, 'i') };
    }

    if (searchLead && typeof searchLead === 'string' && searchLead.trim()) {
      const q = searchLead.trim();
      filter.$or = [
        { leadName: { $regex: q, $options: 'i' } },
        { leadPhone: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
        { outcome: { $regex: q, $options: 'i' } },
      ];
    }

    const logs = await CallLog.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      callLogs: logs.map(formatCallLog),
      count: logs.length,
    });
  } catch (error: any) {
    console.error('[CallLogController] getCallLogs error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch call logs' });
  }
};

// 2. CREATE A NEW CALL LOG ENTRY
export const logCall = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    const { leadId, leadName, leadPhone, userName, outcome, notes, durationSeconds } = req.body;

    if (!leadName || !leadPhone) {
      res.status(400).json({ error: 'Lead name and phone number are required' });
      return;
    }

    const resolvedUserName = userName || req.user?.name || 'Agent';

    const newLog = new CallLog({
      organizationId: orgId,
      leadId: leadId || '',
      leadName: leadName.trim(),
      leadPhone: leadPhone.trim(),
      userId: req.user?.userId ? (req.user.userId as any) : undefined,
      userName: resolvedUserName,
      outcome: outcome || 'Connected',
      notes: notes || '',
      durationSeconds: Number(durationSeconds || 0),
    });

    await newLog.save();

    res.status(201).json({
      message: 'Call logged successfully',
      callLog: formatCallLog(newLog),
    });
  } catch (error: any) {
    console.error('[CallLogController] logCall error:', error);
    res.status(500).json({ error: error.message || 'Failed to log call' });
  }
};

// 3. DELETE CALL LOG ENTRY
export const deleteCallLog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const log = await CallLog.findOneAndDelete({ _id: id, organizationId: orgId });
    if (!log) {
      res.status(404).json({ error: 'Call log not found' });
      return;
    }

    res.status(200).json({
      message: 'Call log deleted successfully',
      id,
    });
  } catch (error: any) {
    console.error('[CallLogController] deleteCallLog error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete call log' });
  }
};
