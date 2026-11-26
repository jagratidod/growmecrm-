import { FilterQuery, Types } from 'mongoose';
import { ILead, Lead, LeadStage } from '../models/Lead';

export function leadStageUpdate(lead: Pick<ILead, 'status' | 'temperature'>, stage: LeadStage, author: string, reason?: string, detail?: string) {
  const timestamp = new Date();
  const set: Record<string, unknown> = {
    status: stage,
    stageChangedAt: timestamp,
    ...(lead.temperature === 'Won' || lead.temperature === 'Lost' ? { temperature: 'Warm' } : {}),
    ...(stage === 'Won' || stage === 'Lost' ? { closedAt: timestamp } : {}),
    ...(stage === 'Proposal sent' ? { proposalSentAt: timestamp } : {}),
    ...(stage === 'Lost' && reason ? { lostReason: reason } : {}),
  };
  const unset = {
    ...(stage !== 'Won' && stage !== 'Lost' ? { closedAt: 1 } : {}),
    ...(stage !== 'Lost' ? { lostReason: 1 } : {}),
  };
  return {
    $set: set,
    ...(Object.keys(unset).length ? { $unset: unset } : {}),
    $push: { activities: { $each: [{
      type: 'stage_changed', fromStage: lead.status, toStage: stage, timestamp, author,
      description: detail || `Stage changed from ${lead.status} to ${stage}${reason ? `: ${reason}` : ''}`,
    }], $position: 0 } },
  };
}

export const convertingBookingStatuses = ['Confirmed', 'Ongoing', 'Completed'];

export async function reconcileConfirmedBooking(booking: { _id: Types.ObjectId; organizationId: Types.ObjectId; leadId?: Types.ObjectId; status: string }, author: string) {
  if (!booking.leadId || !convertingBookingStatuses.includes(booking.status)) return;

  const identity: FilterQuery<ILead> = { _id: booking.leadId, organizationId: booking.organizationId, status: { $ne: 'Won' } };
  // Retry once if another stage edit wins the compare-and-set.
  for (let attempt = 0; attempt < 2; attempt++) {
    const lead = await Lead.findOne(identity).select('status temperature').lean();
    if (!lead) return;
    const updated = await Lead.updateOne({ ...identity, status: lead.status }, leadStageUpdate(
      lead, 'Won', author, undefined, `Booking confirmed · ${booking._id.toString()}`,
    ));
    if (updated.modifiedCount) return;
  }
  throw new Error('Lead stage changed while confirming a booking.');
}
