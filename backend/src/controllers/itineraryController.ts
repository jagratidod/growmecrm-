import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Itinerary, IItinerary, IItineraryDay } from '../models/Itinerary';

const DEFAULT_SAMPLE_ITINERARIES = [
  {
    customerName: 'Aarav Mehta',
    email: 'aarav.mehta@gmail.com',
    phone: '+91 98201 44521',
    destination: 'Bali, Indonesia',
    status: 'Confirmed',
    departure: new Date('2026-12-10'),
    returnDate: new Date('2026-12-15'),
    travellers: 2,
    totalAmount: 185000,
    amountPaid: 95000,
    currency: 'INR',
    package: 'Bali Romantic Escape (5D/4N)',
    assignedTo: 'Kushal Pareta',
    notes: 'Honeymoon couple, requested sea-view pool villa in Seminyak.',
    days: [
      {
        id: 'day-1',
        dayNumber: 1,
        title: 'Arrival at Denpasar & Sunset in Uluwatu',
        description: 'Airport welcome by private chauffeur, private transfer to Seminyak luxury pool villa. Evening visit to Uluwatu Temple with Kecak dance show.',
        activities: ['Private Airport Transfer', 'Villa Check-in', 'Uluwatu Sunset Temple Tour', 'Kecak Dance Show'],
        hotel: 'The Seminyak Beach Resort & Spa',
        meals: ['Dinner'],
      },
      {
        id: 'day-2',
        dayNumber: 2,
        title: 'Ubud Culture & Tegalalang Rice Terraces',
        description: 'Explore the spiritual heart of Bali. Visit the Sacred Monkey Forest, iconic Ubud Art Market, and the stunning Tegalalang rice terraces.',
        activities: ['Monkey Forest Sanctuary', 'Bali Swing experience', 'Tegalalang Terrace Walk', 'Coffee Plantation Tasting'],
        hotel: 'The Seminyak Beach Resort & Spa',
        meals: ['Breakfast', 'Lunch'],
      },
      {
        id: 'day-3',
        dayNumber: 3,
        title: 'Nusa Penida Island Speedboat Day Tour',
        description: 'Full day excursion to Nusa Penida: visit Kelingking T-Rex cliff, Angel Billabong, Broken Beach, and snorkel at Crystal Bay.',
        activities: ['Fast Boat to Nusa Penida', 'Kelingking Secret Point', 'Broken Beach & Angel Billabong', 'Snorkeling at Crystal Bay'],
        hotel: 'The Seminyak Beach Resort & Spa',
        meals: ['Breakfast', 'Packed Lunch'],
      },
    ],
  },
  {
    customerName: 'Sneha Kapoor',
    email: 'sneha.k@outlook.com',
    phone: '+91 97112 88402',
    destination: 'Kashmir, India',
    status: 'Pending',
    departure: new Date('2027-01-05'),
    returnDate: new Date('2027-01-11'),
    travellers: 4,
    totalAmount: 220000,
    amountPaid: 60000,
    currency: 'INR',
    package: 'Kashmir Paradise Tour (6D/5N)',
    assignedTo: 'Priya Sharma',
    notes: 'Family trip with 2 seniors. Requires ground floor rooms and heated vehicles.',
    days: [
      {
        id: 'day-1',
        dayNumber: 1,
        title: 'Arrival in Srinagar & Dal Lake Shikara Ride',
        description: 'Transfer to Dal Lake deluxe houseboat. Sunset Shikara ride covering floating gardens and Char Chinar.',
        activities: ['Houseboat check-in', '1-hour Shikara Ride', 'Local craft bazaar walk'],
        hotel: 'Mascot Deluxe Houseboats Srinagar',
        meals: ['Dinner'],
      },
      {
        id: 'day-2',
        dayNumber: 2,
        title: 'Srinagar to Gulmarg Gondola Cable Car Excursion',
        description: 'Scenic drive to Gulmarg. Phase 1 & Phase 2 Gondola ride up to Apharwat peak for snow activities.',
        activities: ['Gulmarg Valley Drive', 'Phase 1 & 2 Gondola Ride', 'Snow sledging'],
        hotel: 'Khyber Himalayan Resort & Spa',
        meals: ['Breakfast', 'Dinner'],
      },
    ],
  },
];

const formatItinerary = (itn: IItinerary) => ({
  id: itn._id.toString(),
  customerName: itn.customerName,
  email: itn.email || '',
  phone: itn.phone || '',
  destination: itn.destination,
  status: itn.status,
  departure: itn.departure ? new Date(itn.departure).toISOString().split('T')[0] : '',
  returnDate: itn.returnDate ? new Date(itn.returnDate).toISOString().split('T')[0] : '',
  travellers: itn.travellers || 2,
  totalAmount: itn.totalAmount || 0,
  amountPaid: itn.amountPaid || 0,
  currency: itn.currency || 'INR',
  package: itn.package || '',
  assignedTo: itn.assignedTo || '',
  notes: itn.notes || '',
  days: (itn.days || []).map((d) => ({
    id: d.id,
    dayNumber: d.dayNumber,
    title: d.title,
    description: d.description || '',
    activities: d.activities || [],
    hotel: d.hotel || '',
    meals: d.meals || [],
  })),
  createdAt: itn.createdAt ? new Date(itn.createdAt).toISOString() : new Date().toISOString(),
  updatedAt: itn.updatedAt ? new Date(itn.updatedAt).toISOString() : new Date().toISOString(),
});

// 1. GET ALL ITINERARIES (with filters, search, and sample auto-seeder)
export const getItineraries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    const { status, search } = req.query;
    const filter: any = { organizationId: orgId };

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { customerName: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } },
        { package: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    let itineraries = await Itinerary.find(filter).sort({ departure: 1, createdAt: -1 });

    // Auto-seed if brand new agency with no records
    if (itineraries.length === 0 && !status && !search) {
      const created = await Itinerary.insertMany(
        DEFAULT_SAMPLE_ITINERARIES.map((s) => ({
          ...s,
          organizationId: orgId,
        }))
      );
      itineraries = created as any;
    }

    res.status(200).json({
      itineraries: itineraries.map(formatItinerary),
      count: itineraries.length,
    });
  } catch (error: any) {
    console.error('[ItineraryController] getItineraries error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch itineraries' });
  }
};

// 2. GET SINGLE ITINERARY BY ID
export const getItineraryById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const itinerary = await Itinerary.findOne({ _id: id, organizationId: orgId });
    if (!itinerary) {
      res.status(404).json({ error: 'Itinerary not found' });
      return;
    }

    res.status(200).json({ itinerary: formatItinerary(itinerary) });
  } catch (error: any) {
    console.error('[ItineraryController] getItineraryById error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch itinerary' });
  }
};

// 3. CREATE NEW ITINERARY
export const createItinerary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      res.status(401).json({ error: 'Organization ID not found' });
      return;
    }

    const {
      customerName,
      email,
      phone,
      destination,
      status,
      departure,
      returnDate,
      travellers,
      totalAmount,
      amountPaid,
      currency,
      package: packageName,
      assignedTo,
      notes,
      days,
    } = req.body;

    if (!customerName || !destination || !departure) {
      res.status(400).json({ error: 'Customer name, destination, and departure date are required' });
      return;
    }

    const initialDays: IItineraryDay[] = Array.isArray(days) && days.length > 0
      ? days.map((d: any, idx: number) => ({
          id: d.id || `day-${idx + 1}`,
          dayNumber: d.dayNumber || idx + 1,
          title: d.title || `Day ${idx + 1} Plan`,
          description: d.description || '',
          activities: d.activities || [],
          hotel: d.hotel || '',
          meals: d.meals || [],
        }))
      : [
          {
            id: `day-${Date.now()}-1`,
            dayNumber: 1,
            title: 'Arrival & Welcome',
            description: `Welcome to ${destination}! Private airport check-in and evening at leisure.`,
            activities: ['Airport pickup', 'Hotel check-in', 'Evening welcome dinner'],
            hotel: '',
            meals: ['Dinner'],
          },
        ];

    const newItinerary = new Itinerary({
      organizationId: orgId,
      customerName: customerName.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      destination: destination.trim(),
      status: status || 'Draft',
      departure: new Date(departure),
      returnDate: returnDate ? new Date(returnDate) : undefined,
      travellers: Number(travellers || 2),
      totalAmount: Number(totalAmount || 0),
      amountPaid: Number(amountPaid || 0),
      currency: currency || 'INR',
      package: packageName || '',
      assignedTo: assignedTo || '',
      notes: notes || '',
      days: initialDays,
    });

    await newItinerary.save();

    res.status(201).json({
      message: 'Itinerary created successfully',
      itinerary: formatItinerary(newItinerary),
    });
  } catch (error: any) {
    console.error('[ItineraryController] createItinerary error:', error);
    res.status(500).json({ error: error.message || 'Failed to create itinerary' });
  }
};

// 4. UPDATE ITINERARY
export const updateItinerary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;
    const {
      customerName,
      email,
      phone,
      destination,
      status,
      departure,
      returnDate,
      travellers,
      totalAmount,
      amountPaid,
      currency,
      package: packageName,
      assignedTo,
      notes,
      days,
    } = req.body;

    const itinerary = await Itinerary.findOne({ _id: id, organizationId: orgId });
    if (!itinerary) {
      res.status(404).json({ error: 'Itinerary not found' });
      return;
    }

    if (customerName !== undefined) itinerary.customerName = customerName.trim();
    if (email !== undefined) itinerary.email = email.trim();
    if (phone !== undefined) itinerary.phone = phone.trim();
    if (destination !== undefined) itinerary.destination = destination.trim();
    if (status !== undefined) itinerary.status = status;
    if (departure !== undefined) itinerary.departure = new Date(departure);
    if (returnDate !== undefined) itinerary.returnDate = new Date(returnDate);
    if (travellers !== undefined) itinerary.travellers = Number(travellers);
    if (totalAmount !== undefined) itinerary.totalAmount = Number(totalAmount);
    if (amountPaid !== undefined) itinerary.amountPaid = Number(amountPaid);
    if (currency !== undefined) itinerary.currency = currency;
    if (packageName !== undefined) itinerary.package = packageName;
    if (assignedTo !== undefined) itinerary.assignedTo = assignedTo;
    if (notes !== undefined) itinerary.notes = notes;

    if (Array.isArray(days)) {
      itinerary.days = days.map((d: any, idx: number) => ({
        id: d.id || `day-${idx + 1}`,
        dayNumber: d.dayNumber || idx + 1,
        title: d.title || `Day ${idx + 1}`,
        description: d.description || '',
        activities: d.activities || [],
        hotel: d.hotel || '',
        meals: d.meals || [],
      }));
    }

    await itinerary.save();

    res.status(200).json({
      message: 'Itinerary updated successfully',
      itinerary: formatItinerary(itinerary),
    });
  } catch (error: any) {
    console.error('[ItineraryController] updateItinerary error:', error);
    res.status(500).json({ error: error.message || 'Failed to update itinerary' });
  }
};

// 5. DELETE ITINERARY
export const deleteItinerary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;

    const itinerary = await Itinerary.findOneAndDelete({ _id: id, organizationId: orgId });
    if (!itinerary) {
      res.status(404).json({ error: 'Itinerary not found' });
      return;
    }

    res.status(200).json({
      message: 'Itinerary deleted successfully',
      id,
    });
  } catch (error: any) {
    console.error('[ItineraryController] deleteItinerary error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete itinerary' });
  }
};

// 6. APPEND A DAY TO ITINERARY
export const addDay = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id } = req.params;
    const { title, description, activities, hotel, meals } = req.body;

    const itinerary = await Itinerary.findOne({ _id: id, organizationId: orgId });
    if (!itinerary) {
      res.status(404).json({ error: 'Itinerary not found' });
      return;
    }

    const nextDayNumber = (itinerary.days?.length || 0) + 1;
    const newDay: IItineraryDay = {
      id: `day-${Date.now()}`,
      dayNumber: nextDayNumber,
      title: title || `Day ${nextDayNumber}`,
      description: description || '',
      activities: activities || [],
      hotel: hotel || '',
      meals: meals || [],
    };

    itinerary.days.push(newDay);
    await itinerary.save();

    res.status(200).json({
      message: 'Day added successfully',
      day: newDay,
      itinerary: formatItinerary(itinerary),
    });
  } catch (error: any) {
    console.error('[ItineraryController] addDay error:', error);
    res.status(500).json({ error: error.message || 'Failed to add day' });
  }
};

// 7. UPDATE SPECIFIC DAY IN ITINERARY
export const updateDay = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id, dayId } = req.params;
    const updates = req.body;

    const itinerary = await Itinerary.findOne({ _id: id, organizationId: orgId });
    if (!itinerary) {
      res.status(404).json({ error: 'Itinerary not found' });
      return;
    }

    const dayIndex = itinerary.days.findIndex((d) => d.id === dayId);
    if (dayIndex === -1) {
      res.status(404).json({ error: 'Day not found in itinerary' });
      return;
    }

    itinerary.days[dayIndex] = {
      ...itinerary.days[dayIndex],
      ...updates,
      id: dayId, // preserve ID
    };

    await itinerary.save();

    res.status(200).json({
      message: 'Day updated successfully',
      itinerary: formatItinerary(itinerary),
    });
  } catch (error: any) {
    console.error('[ItineraryController] updateDay error:', error);
    res.status(500).json({ error: error.message || 'Failed to update day' });
  }
};

// 8. DELETE SPECIFIC DAY AND RENUMBER SUBSEQUENT DAYS
export const deleteDay = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.organizationId;
    const { id, dayId } = req.params;

    const itinerary = await Itinerary.findOne({ _id: id, organizationId: orgId });
    if (!itinerary) {
      res.status(404).json({ error: 'Itinerary not found' });
      return;
    }

    const filtered = itinerary.days.filter((d) => d.id !== dayId);
    itinerary.days = filtered.map((d, idx) => ({
      ...d,
      dayNumber: idx + 1,
    }));

    await itinerary.save();

    res.status(200).json({
      message: 'Day removed successfully',
      itinerary: formatItinerary(itinerary),
    });
  } catch (error: any) {
    console.error('[ItineraryController] deleteDay error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete day' });
  }
};
