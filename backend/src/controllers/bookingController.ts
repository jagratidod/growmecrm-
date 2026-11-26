import { isValidObjectId } from 'mongoose';
import { convertingBookingStatuses, reconcileConfirmedBooking } from '../services/leadLifecycle';
import { Lead } from '../models/Lead';
import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { BookingModel, IBooking } from '../models/Booking';

// Helper to format Mongoose document to frontend-compatible Booking
const formatBooking = (doc: IBooking) => {
  const obj = doc.toObject();
  return {
    ...obj,
    id: doc._id.toString(),
    leadId: doc.leadId?.toString(),
    _id: undefined,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
};

function entersConfirmed(previous: string, next: string) {
  return !convertingBookingStatuses.includes(previous) && convertingBookingStatuses.includes(next);
}

async function syncLinkedLead(booking: IBooking, author: string) {
  if (!booking.leadConversionPending || !convertingBookingStatuses.includes(booking.status)) return {};
  try {
    await reconcileConfirmedBooking(booking, author);
    await BookingModel.updateOne({ _id: booking._id, organizationId: booking.organizationId, leadConversionPending: true },
      { $unset: { leadConversionPending: 1 } }, { timestamps: false });
    booking.leadConversionPending = undefined;
    return {};
  } catch (error) {
    console.error('[Booking lead reconciliation]', booking._id.toString(), error instanceof Error ? error.name : 'Unknown error');
    return { leadSyncWarning: 'Booking saved. Retry the linked lead update from the booking details.' };
  }
}

export const retryBookingLeadSync = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const booking = await BookingModel.findOne({ _id: req.params.id, organizationId: req.user?.organizationId });
    if (!booking) { res.status(404).json({ error: 'Booking not found.' }); return; }
    if (booking.leadConversionPending && !convertingBookingStatuses.includes(booking.status)) {
      res.status(409).json({ error: 'Only confirmed bookings can mark a lead as won.' }); return;
    }
    const sync = await syncLinkedLead(booking, req.user?.name || 'Agent');
    res.json({ ...formatBooking(booking), ...sync });
  } catch {
    res.status(500).json({ error: 'Could not retry the linked lead update.' });
  }
};

// 1. GET ALL BOOKINGS WITH FILTERS & FINANCIAL STATS
export const getBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const { search, status } = req.query;

    const query: any = { organizationId };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      query.$or = [
        { customerName: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { package: { $regex: q, $options: 'i' } },
      ];
    }

    const bookings = await BookingModel.find(query).sort({ departure: 1 });

    // Compute live financial metrics for the agency
    const allOrgBookings = await BookingModel.find({ organizationId });
    const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. "2026-11"

    let departingThisMonthCount = 0;
    let totalPipelineValue = 0;
    let totalCollected = 0;

    allOrgBookings.forEach((b) => {
      if (b.departure && b.departure.startsWith(currentMonthStr)) {
        departingThisMonthCount++;
      }
      if (b.status !== 'Cancelled') {
        totalPipelineValue += b.totalAmount || 0;
        totalCollected += b.amountPaid || 0;
      }
    });

    res.status(200).json({
      bookings: bookings.map(formatBooking),
      stats: {
        totalBookings: allOrgBookings.length,
        departingThisMonth: departingThisMonthCount,
        pipelineValue: totalPipelineValue,
        collected: totalCollected,
      },
    });
  } catch (error: any) {
    console.error('getBookings error:', error);
    res.status(500).json({ error: error.message || 'Error fetching bookings' });
  }
};

// 2. GET SINGLE BOOKING BY ID
export const getBookingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const booking = await BookingModel.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.status(200).json(formatBooking(booking));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching booking' });
  }
};

// 3. CREATE NEW BOOKING
export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const body = req.body;

    if (!body.customerName?.trim() || !body.destination?.trim() || !body.departure) {
      res.status(400).json({ error: 'Customer name, destination, and departure date are required.' });
      return;
    }

    const totalAmount = Number(body.totalAmount ?? 0);
    const amountPaid = Number(body.amountPaid ?? 0);
    if (!Number.isFinite(totalAmount) || !Number.isFinite(amountPaid) || totalAmount < 0 || amountPaid < 0 || amountPaid > totalAmount) {
      res.status(400).json({ error: 'Payment must be between zero and the booking total.' });
      return;
    }
    if (body.returnDate && body.returnDate < body.departure) {
      res.status(400).json({ error: 'Return date cannot be before departure.' });
      return;
    }
    if (body.leadId && (!isValidObjectId(body.leadId) || !await Lead.exists({ _id: body.leadId, organizationId, archivedAt: null }))) {
      res.status(404).json({ error: 'Lead not found in this workspace.' });
      return;
    }

    const status = amountPaid > 0 && (!body.status || body.status === 'Pending') ? 'Confirmed' : body.status || 'Pending';
    const newBooking = await BookingModel.create({
      organizationId,
      leadId: body.leadId || undefined,
      customerName: body.customerName.trim(),
      email: body.email?.trim() || '',
      phone: body.phone?.trim() || '',
      destination: body.destination.trim(),
      status,
      leadConversionPending: body.leadId && convertingBookingStatuses.includes(status) ? true : undefined,
      departure: body.departure,
      returnDate: body.returnDate || '',
      travellers: body.travellers ? Number(body.travellers) : 1,
      totalAmount,
      amountPaid,
      currency: body.currency || 'INR',
      package: body.package?.trim() || '',
      assignedTo: body.assignedTo?.trim() || 'Unassigned',
      notes: body.notes?.trim() || '',
    });

    const sync = await syncLinkedLead(newBooking, req.user?.name || 'Agent');
    res.status(201).json({ ...formatBooking(newBooking), ...sync });
  } catch (error: any) {
    console.error('createBooking error:', error);
    res.status(500).json({ error: error.message || 'Error creating booking' });
  }
};

// 4. UPDATE BOOKING
export const updateBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const booking = await BookingModel.findOne({
      _id: req.params.id,
      organizationId,
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const editableFields = ['customerName', 'email', 'phone', 'destination', 'status', 'departure',
      'returnDate', 'travellers', 'totalAmount', 'currency', 'package', 'assignedTo', 'notes'];
    const updates = Object.fromEntries(editableFields.filter((field) => req.body[field] !== undefined)
      .map((field) => [field, req.body[field]]));
    if (updates.totalAmount !== undefined) updates.totalAmount = Number(updates.totalAmount);
    if (updates.travellers !== undefined) updates.travellers = Number(updates.travellers);

    const departure = updates.departure ?? booking.departure;
    const returnDate = updates.returnDate ?? booking.returnDate;
    if (returnDate && returnDate < departure) {
      res.status(400).json({ error: 'Return date cannot be before departure.' });
      return;
    }
    if (updates.totalAmount !== undefined && (!Number.isFinite(updates.totalAmount) || updates.totalAmount < (booking.amountPaid || 0))) {
      res.status(400).json({ error: 'Booking total cannot be less than the amount collected.' });
      return;
    }

    if (booking.leadId && updates.status && entersConfirmed(booking.status, updates.status)) updates.leadConversionPending = true;
    const filter = { _id: booking._id, organizationId,
      ...(updates.status !== undefined && { status: booking.status }),
      ...(updates.totalAmount !== undefined && { $expr: { $lte: [{ $ifNull: ['$amountPaid', 0] }, updates.totalAmount] } }),
    };
    const updated = await BookingModel.findOneAndUpdate(filter, { $set: updates }, { new: true, runValidators: true });
    if (!updated) {
      res.status(409).json({ error: 'This booking changed. Reload it and try again.' });
      return;
    }
    const sync = await syncLinkedLead(updated, req.user?.name || 'Agent');
    res.status(200).json({ ...formatBooking(updated), ...sync });
  } catch (error: any) {
    console.error('updateBooking error:', error);
    res.status(500).json({ error: error.message || 'Error updating booking' });
  }
};

// 5. RECORD PAYMENT (Installment)
export const recordPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount !== Number(amount.toFixed(2))) {
      res.status(400).json({ error: 'Enter a positive payment amount with up to two decimal places.' });
      return;
    }

    const identity = { _id: req.params.id, organizationId: req.user?.organizationId };
    const alreadyPaid = { $ifNull: ['$amountPaid', 0] };
    const booking = await BookingModel.findOneAndUpdate({
      ...identity,
      status: { $ne: 'Cancelled' },
      $expr: { $gte: [{ $round: [{ $subtract: ['$totalAmount', alreadyPaid] }, 2] }, amount] },
    }, [{
      $set: {
        amountPaid: { $round: [{ $add: [alreadyPaid, amount] }, 2] },
        status: { $cond: [{ $eq: ['$status', 'Pending'] }, 'Confirmed', '$status'] },
        leadConversionPending: { $or: [
          { $eq: ['$leadConversionPending', true] },
          { $and: [{ $eq: ['$status', 'Pending'] }, { $ne: [{ $ifNull: ['$leadId', null] }, null] }] },
        ] },
      },
    }], { new: true });

    if (!booking) {
      const exists = await BookingModel.exists(identity);
      res.status(exists ? 409 : 404).json({
        error: exists ? 'Check the latest balance and booking status before recording this payment.' : 'Booking not found.',
      });
      return;
    }

    const sync = await syncLinkedLead(booking, req.user?.name || 'Agent');
    res.json({
      ...sync,
      message: 'Payment recorded successfully',
      booking: formatBooking(booking),
      addedAmount: amount,
      balanceDue: Number((booking.totalAmount - booking.amountPaid).toFixed(2)),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error recording payment' });
  }
};

// 6. UPDATE BOOKING STATUS
export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'].includes(status)) {
      res.status(400).json({ error: 'Invalid booking status' });
      return;
    }

    const booking = await BookingModel.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const updates = { status, ...(booking.leadId && entersConfirmed(booking.status, status) ? { leadConversionPending: true } : {}) };
    const updated = await BookingModel.findOneAndUpdate({ _id: booking._id, organizationId: booking.organizationId, status: booking.status },
      { $set: updates }, { new: true, runValidators: true });
    if (!updated) { res.status(409).json({ error: 'This booking changed. Refresh and try again.' }); return; }
    const sync = await syncLinkedLead(updated, req.user?.name || 'Agent');
    res.json({ ...formatBooking(updated), ...sync });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating booking status' });
  }
};

// 7. DELETE BOOKING
export const deleteBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await BookingModel.deleteOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Booking not found or already deleted' });
      return;
    }

    res.status(200).json({ message: 'Booking deleted successfully', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting booking' });
  }
};
