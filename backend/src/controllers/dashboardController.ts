import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Lead, ILead } from '../models/Lead';
import { Booking, IBooking } from '../models/Booking';
import { FollowUp, IFollowUp } from '../models/FollowUp';
import { User } from '../models/User';
import { TeamInvite } from '../models/TeamInvite';

// Helper to get local date in YYYY-MM-DD
const getTodayStr = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const getDashboardSummary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const todayStr = getTodayStr();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Run parallel aggregation queries for optimal performance
    const [
      leads,
      bookings,
      followUps,
      teamMembersCount,
      pendingInvitesCount,
    ]: [ILead[], IBooking[], IFollowUp[], number, number] = await Promise.all([
      Lead.find({ organizationId }).sort({ createdAt: -1 }),
      Booking.find({ organizationId }).sort({ departure: 1 }),
      FollowUp.find({ organizationId }).sort({ dueDate: 1 }),
      User.countDocuments({ organizationId, status: 'Active' }),
      TeamInvite.countDocuments({ organizationId, status: 'Invited' }),
    ]);

    // 1. KPI Metric Stats Calculation
    const totalLeads = leads.length;
    const openLeads = leads.filter((l: ILead) => l.status !== 'Won' && l.status !== 'Lost').length;
    const wonLeads = leads.filter((l: ILead) => l.status === 'Won').length;
    const lostLeads = leads.filter((l: ILead) => l.status === 'Lost').length;

    const newThisWeek = leads.filter((l: ILead) => {
      const created = new Date(l.createdAt);
      return created >= sevenDaysAgo;
    }).length;

    const totalBookings = bookings.length;

    const departingThisMonth = bookings.filter((b: IBooking) => {
      if (!b.departure) return false;
      const depDate = new Date(b.departure);
      return depDate.getMonth() === currentMonth && depDate.getFullYear() === currentYear;
    }).length;

    // Calculate Trip Value: sum of bookings totalAmount, or sum of won leads budget if no bookings
    const bookingsTripValue = bookings.reduce((sum: number, b: IBooking) => sum + (b.totalAmount || 0), 0);
    const leadsWonValue = leads
      .filter((l: ILead) => l.status === 'Won')
      .reduce((sum: number, l: ILead) => sum + (l.budget || 0), 0);
    const totalTripValue = bookingsTripValue > 0 ? bookingsTripValue : leadsWonValue;

    // Total collected cash
    const totalCollected = bookings.reduce((sum: number, b: IBooking) => sum + (b.amountPaid || 0), 0);

    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    // 2. Pipeline Stage Breakdown
    const STAGES = [
      { stage: 'New', label: 'New Enquiry', color: '#6366f1', bg: 'bg-indigo-500' },
      { stage: 'Contacted', label: 'Contacted', color: '#0ea5e9', bg: 'bg-sky-500' },
      { stage: 'Qualified', label: 'Qualified', color: '#eab308', bg: 'bg-yellow-500' },
      { stage: 'Proposal sent', label: 'Proposal Sent', color: '#a855f7', bg: 'bg-purple-500' },
      { stage: 'Won', label: 'Won', color: '#10b981', bg: 'bg-emerald-500' },
    ];

    const pipeline = STAGES.map((s) => {
      const stageLeads = leads.filter((l: ILead) => l.status === s.stage);
      const count = stageLeads.length;
      const value = stageLeads.reduce((acc: number, l: ILead) => acc + (l.budget || 0), 0);
      const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
      return {
        ...s,
        count,
        value,
        percentage,
      };
    });

    // 3. Recent 5 Leads
    const recentLeads = leads.slice(0, 5).map((l: ILead) => ({
      id: l._id.toString(),
      name: l.name,
      email: l.email,
      phone: l.phone,
      destination: l.destination || 'Unspecified',
      travelers: l.travelers || 1,
      budget: l.budget || 0,
      status: l.status,
      assignedTo: l.assignedTo,
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    }));

    // 4. Follow-ups Due & Overdue
    const overdueFollowUps = followUps.filter(
      (f: IFollowUp) => f.status === 'overdue' || (f.dueDate < todayStr && f.status !== 'completed')
    );
    const todayFollowUps = followUps.filter(
      (f: IFollowUp) => f.dueDate === todayStr && f.status !== 'completed'
    );
    const pendingFollowUps = followUps.filter(
      (f: IFollowUp) => f.status !== 'completed'
    );

    const upcomingFollowUpsList = pendingFollowUps.slice(0, 5).map((f: IFollowUp) => ({
      id: f._id.toString(),
      title: f.title || f.leadName,
      leadName: f.leadName,
      phone: f.phone,
      destination: f.destination,
      dueDate: f.dueDate,
      dueTime: f.dueTime,
      type: f.type,
      note: f.note,
      status: f.dueDate < todayStr ? 'overdue' : f.status,
    }));

    // 5. Upcoming Departures (next 30 days)
    const upcomingDepartures = bookings
      .filter((b: IBooking) => {
        if (!b.departure) return false;
        const dep = new Date(b.departure);
        return dep >= now && dep <= thirtyDaysAhead;
      })
      .slice(0, 5)
      .map((b: IBooking) => ({
        id: b._id.toString(),
        customerName: b.customerName,
        destination: b.destination,
        departure: b.departure,
        daysUntil: Math.ceil((new Date(b.departure).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        travellers: b.travellers,
        status: b.status,
        totalAmount: b.totalAmount,
        amountPaid: b.amountPaid,
      }));

    res.status(200).json({
      metrics: {
        totalLeads,
        openLeads,
        wonLeads,
        lostLeads,
        newThisWeek,
        totalBookings,
        departingThisMonth,
        totalTripValue,
        totalCollected,
        conversionRate,
      },
      pipeline,
      recentLeads,
      followUps: {
        dueTodayCount: todayFollowUps.length,
        overdueCount: overdueFollowUps.length,
        totalPendingCount: pendingFollowUps.length,
        items: upcomingFollowUpsList,
      },
      upcomingDepartures,
      team: {
        activeMembers: teamMembersCount,
        pendingInvites: pendingInvitesCount,
      },
    });
  } catch (error: any) {
    console.error('[Dashboard Summary Error]:', error);
    res.status(500).json({ error: error.message || 'Error compiling dashboard summary' });
  }
};
