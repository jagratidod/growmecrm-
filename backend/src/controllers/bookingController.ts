import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { BookingModel, IBooking } from '../models/Booking';

// Helper to format Mongoose document to frontend-compatible Booking
const formatBooking = (doc: IBooking) => {
  const obj = doc.toObject();
  return {
    ...obj,
    id: doc._id.toString(),
    _id: undefined,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
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

    const newBooking = await BookingModel.create({
      organizationId,
      customerName: body.customerName.trim(),
      email: body.email?.trim() || '',
      phone: body.phone?.trim() || '',
      destination: body.destination.trim(),
      status: body.status || 'Pending',
      departure: body.departure,
      returnDate: body.returnDate || '',
      travellers: body.travellers ? Number(body.travellers) : 1,
      totalAmount: body.totalAmount ? Number(body.totalAmount) : 0,
      amountPaid: body.amountPaid ? Number(body.amountPaid) : 0,
      currency: body.currency || 'INR',
      package: body.package?.trim() || '',
      assignedTo: body.assignedTo?.trim() || 'Unassigned',
      notes: body.notes?.trim() || '',
    });

    res.status(201).json(formatBooking(newBooking));
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

    const updates = req.body;
    delete updates._id;
    delete updates.id;
    delete updates.organizationId;

    if (updates.totalAmount !== undefined) updates.totalAmount = Number(updates.totalAmount);
    if (updates.amountPaid !== undefined) updates.amountPaid = Number(updates.amountPaid);
    if (updates.travellers !== undefined) updates.travellers = Number(updates.travellers);

    Object.assign(booking, updates);
    await booking.save();

    res.status(200).json(formatBooking(booking));
  } catch (error: any) {
    console.error('updateBooking error:', error);
    res.status(500).json({ error: error.message || 'Error updating booking' });
  }
};

// 5. RECORD PAYMENT (Installment)
export const recordPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const payAmount = Number(amount);

    if (!payAmount || payAmount <= 0) {
      res.status(400).json({ error: 'Valid payment amount is required' });
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

    const currentPaid = booking.amountPaid || 0;
    const newPaid = Math.min(booking.totalAmount, currentPaid + payAmount);
    booking.amountPaid = newPaid;

    // Automatically confirm if paid in full or partial
    if (booking.status === 'Pending' && newPaid > 0) {
      booking.status = 'Confirmed';
    }

    await booking.save();

    res.status(200).json({
      message: 'Payment recorded successfully',
      booking: formatBooking(booking),
      addedAmount: payAmount,
      balanceDue: Math.max(0, booking.totalAmount - newPaid),
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

    booking.status = status;
    await booking.save();

    res.status(200).json(formatBooking(booking));
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
