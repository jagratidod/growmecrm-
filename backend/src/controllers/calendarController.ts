import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { CalendarEvent, ICalendarEvent } from '../models/CalendarEvent';
import { Booking } from '../models/Booking';

const formatEvent = (evt: ICalendarEvent) => ({
  id: evt._id.toString(),
  title: evt.title,
  date: evt.date,
  notes: evt.notes || '',
  type: evt.type,
  color: evt.color || '#453372',
  linkedBookingId: evt.linkedBookingId || '',
  createdAt: evt.createdAt ? new Date(evt.createdAt).toISOString() : new Date().toISOString(),
});

// 1. GET ALL CALENDAR EVENTS (Manual events + automatically merged Booking departures & returns)
export const getCalendarEvents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    // Fetch manual agency events
    const manualEvents = await CalendarEvent.find({ organizationId: orgId }).sort({ date: 1 });
    if (req.query.scope === 'manual') {
      res.json({ events: manualEvents.map(formatEvent), manualCount: manualEvents.length, bookingCount: 0 });
      return;
    }

    // Fetch active bookings for this organization to generate auto-milestones
    const bookings = await Booking.find({ organizationId: orgId }).sort({ departure: 1 });

    const bookingEvents = [];

    for (const b of bookings) {
      if (b.departure) {
        const depDate = new Date(b.departure).toISOString().split('T')[0];
        bookingEvents.push({
          id: `b-dep-${b._id}`,
          title: `🛫 Departure: ${b.customerName} (${b.destination})`,
          date: depDate,
          notes: `Booking for ${b.travellers} pax · Total: ₹${(b.totalAmount || 0).toLocaleString('en-IN')}`,
          type: 'departure' as const,
          color: '#0891b2',
          linkedBookingId: b._id.toString(),
          createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
        });
      }
      if (b.returnDate) {
        const retDate = new Date(b.returnDate).toISOString().split('T')[0];
        bookingEvents.push({
          id: `b-ret-${b._id}`,
          title: `🛬 Return: ${b.customerName}`,
          date: retDate,
          notes: `Trip completed for ${b.destination}`,
          type: 'return' as const,
          color: '#059669',
          linkedBookingId: b._id.toString(),
          createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
        });
      }
    }

    const allEvents = [...manualEvents.map(formatEvent), ...bookingEvents];

    res.status(200).json({
      events: allEvents,
      manualCount: manualEvents.length,
      bookingCount: bookingEvents.length,
    });
  } catch (error: any) {
    console.error('[CalendarController] getCalendarEvents error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch calendar events' });
  }
};

// 2. CREATE A NEW MANUAL EVENT
export const createCalendarEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    const { title, date, notes, type, color, linkedBookingId } = req.body;

    if (!title || !date) {
      res.status(400).json({ error: 'Event title and date (YYYY-MM-DD) are required' });
      return;
    }

    const newEvent = new CalendarEvent({
      organizationId: orgId,
      title: title.trim(),
      date: String(date).split('T')[0].trim(),
      notes: notes || '',
      type: type || 'manual',
      color: color || '#453372',
      linkedBookingId: linkedBookingId || '',
    });

    await newEvent.save();

    res.status(201).json({
      message: 'Calendar event created successfully',
      event: formatEvent(newEvent),
    });
  } catch (error: any) {
    console.error('[CalendarController] createCalendarEvent error:', error);
    res.status(500).json({ error: error.message || 'Failed to create calendar event' });
  }
};

// 3. DELETE A MANUAL CALENDAR EVENT
export const deleteCalendarEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const event = await CalendarEvent.findOneAndDelete({ _id: id, organizationId: orgId });
    if (!event) {
      res.status(404).json({ error: 'Calendar event not found' });
      return;
    }

    res.status(200).json({
      message: 'Calendar event deleted successfully',
      id,
    });
  } catch (error: any) {
    console.error('[CalendarController] deleteCalendarEvent error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete calendar event' });
  }
};
