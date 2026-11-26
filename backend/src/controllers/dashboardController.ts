import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../types';
import { Lead, leadStages } from '../models/Lead';
import { Booking } from '../models/Booking';
import { FollowUp } from '../models/FollowUp';
import { User } from '../models/User';
import { TeamInvite } from '../models/TeamInvite';
import { workspaceAccess } from '../platform/access';

const dayMs = 86_400_000;
const dayKey = (date: Date) => date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.user?.organizationId;
    const access = id ? await workspaceAccess(id) : null;
    if (!access) {
      res.status(403).json({ error: 'This workspace is unavailable.' });
      return;
    }

    const organizationId = new Types.ObjectId(access.organization.id);
    const { enabled } = access;
    const now = new Date();
    const today = dayKey(now);
    const month = today.slice(0, 7);
    const lastDay = dayKey(new Date(now.getTime() + 30 * dayMs));
    const weekStart = new Date(Date.parse(today) - 6 * dayMs - 330 * 60_000);

    const [leadGroups, sources, recentLeads, bookingTotals, departures, followUpGroups, dueItems, activeMembers, pendingInvites] = await Promise.all([
      enabled.includes('leads') ? Lead.aggregate<{ _id: string; count: number; newCount: number; averageDays: number | null }>([
        { $match: { organizationId, archivedAt: null } },
        { $group: {
          _id: '$status', count: { $sum: 1 },
          newCount: { $sum: { $cond: [{ $gte: ['$createdAt', weekStart] }, 1, 0] } },
          averageDays: { $avg: { $cond: [
            { $in: ['$status', ['Won', 'Lost']] }, null,
            { $divide: [{ $subtract: [now, { $ifNull: ['$stageChangedAt', { $cond: [{ $eq: ['$status', 'New'] }, '$createdAt', null] }] }] }, dayMs] },
          ] } },
        } },
      ]) : [],
      enabled.includes('leads') ? Lead.aggregate<{ _id: string; total: number; won: number }>([
        { $match: { organizationId, archivedAt: null } },
        { $group: { _id: { $ifNull: ['$source', 'Manual'] }, total: { $sum: 1 }, won: { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] } } } },
        { $sort: { total: -1, _id: 1 } },
      ]) : [],
      enabled.includes('leads') ? Lead.find({ organizationId, archivedAt: null }).select('name destination status createdAt').sort({ createdAt: -1 }).limit(5).lean() : [],
      enabled.includes('bookings') ? Booking.aggregate<{ _id: string; count: number; tripValue: number; collected: number; departing: number }>([
        { $match: { organizationId } },
        { $group: {
          _id: { $ifNull: ['$currency', 'INR'] },
          count: { $sum: 1 },
          tripValue: { $sum: { $cond: [{ $ne: ['$status', 'Cancelled'] }, '$totalAmount', 0] } },
          collected: { $sum: { $cond: [{ $ne: ['$status', 'Cancelled'] }, '$amountPaid', 0] } },
          departing: { $sum: { $cond: [{ $and: [
            { $ne: ['$status', 'Cancelled'] },
            { $eq: [{ $substrBytes: [{ $ifNull: ['$departure', ''] }, 0, 7] }, month] },
          ] }, 1, 0] } },
        } },
        { $sort: { _id: 1 } },
      ]) : [],
      enabled.includes('bookings') ? Booking.find({ organizationId, departure: { $gte: today, $lte: lastDay }, status: { $in: ['Confirmed', 'Ongoing'] } })
        .select('customerName destination departure status').sort({ departure: 1, _id: 1 }).limit(5).lean() : [],
      enabled.includes('leads') ? FollowUp.aggregate<{ _id: string; count: number }>([
        { $match: { organizationId, status: { $ne: 'completed' } } },
        { $group: { _id: { $switch: { branches: [
          { case: { $lt: ['$dueDate', today] }, then: 'overdue' },
          { case: { $eq: ['$dueDate', today] }, then: 'today' },
        ], default: 'upcoming' } }, count: { $sum: 1 } } },
      ]) : [],
      enabled.includes('leads') ? FollowUp.find({ organizationId, status: { $ne: 'completed' }, dueDate: { $lte: today } })
        .select('title leadName dueDate dueTime').sort({ dueDate: 1, dueTime: 1, _id: 1 }).limit(5).lean() : [],
      enabled.includes('team') ? User.countDocuments({ organizationId, status: 'Active' }) : 0,
      enabled.includes('team') ? TeamInvite.countDocuments({ organizationId, status: 'Invited' }) : 0,
    ]);

    const totalLeads = leadGroups.reduce((total, group) => total + group.count, 0);
    const pipeline = leadStages.map((stage) => {
      const group = leadGroups.find((item) => item._id === stage);
      return { stage, count: group?.count ?? 0, averageDays: group?.averageDays == null ? null : Math.max(0, group.averageDays) };
    });
    const wonLeads = leadGroups.find((item) => item._id === 'Won')?.count ?? 0;
    const lostLeads = leadGroups.find((item) => item._id === 'Lost')?.count ?? 0;

    res.json({
      metrics: {
        totalLeads, openLeads: totalLeads - wonLeads - lostLeads, wonLeads,
        newThisWeek: leadGroups.reduce((total, group) => total + group.newCount, 0),
        totalBookings: bookingTotals.reduce((total, booking) => total + booking.count, 0),
        departingThisMonth: bookingTotals.reduce((total, booking) => total + booking.departing, 0),
        paymentsByCurrency: bookingTotals.map(({ _id, tripValue, collected }) => ({ currency: _id, tripValue, collected })),
      },
      pipeline,
      sources: sources.map(({ _id, total, won }) => ({ source: _id, total, won })),
      recentLeads: recentLeads.map(({ _id, name, destination, status, createdAt }) => ({ id: _id.toString(), name, destination, status, createdAt })),
      followUps: {
        dueTodayCount: followUpGroups.find((group) => group._id === 'today')?.count ?? 0,
        overdueCount: followUpGroups.find((group) => group._id === 'overdue')?.count ?? 0,
        items: dueItems.map(({ _id, title, leadName, dueDate, dueTime }) => ({
          id: _id.toString(), title, leadName, dueDate, dueTime, status: dueDate < today ? 'overdue' : 'pending',
        })),
      },
      upcomingDepartures: departures.map(({ _id, customerName, destination, departure, status }) => ({
        id: _id.toString(), customerName, destination, departure, status,
      })),
      team: { activeMembers, pendingInvites },
    });
  } catch (error) {
    console.error('[Dashboard Summary Error]:', error instanceof Error ? error.name : 'Unknown error');
    res.status(500).json({ error: 'Could not load the dashboard.' });
  }
};
