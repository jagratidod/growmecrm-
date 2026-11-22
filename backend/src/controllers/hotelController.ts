import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Hotel, IHotel } from '../models/Hotel';

// Default initial demo partner hotels for newly onboarded agencies
const DEFAULT_HOTEL_SEEDS = [
  {
    name: 'The Grand Bali Resort',
    city: 'Ubud',
    address: 'Jl. Raya Campuhan No. 12, Ubud, Gianyar, Bali',
    stars: 5,
    pricePerNight: 8500,
    currency: 'INR',
    phone: '+62 361 975 688',
    email: 'reservations@thegrandbali.com',
    commissionRate: 15,
    notes: 'Contract rate: ₹8,500/night incl. breakfast & tax. Contact: Wayan (Sales Manager). 15% agency commission on pool villas.',
    roomTypes: [
      { name: 'Deluxe Suite', pricePerNight: 8500, inclusions: 'Breakfast & Taxes', capacity: 2 },
      { name: 'Private Pool Villa', pricePerNight: 16500, inclusions: 'Breakfast, Airport Pickup & High Tea', capacity: 4 },
    ],
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    name: 'The Khyber Himalayan Resort & Spa',
    city: 'Gulmarg',
    address: 'Near Gondola Base Station, Gulmarg, Kashmir',
    stars: 5,
    pricePerNight: 22000,
    currency: 'INR',
    phone: '+91 1954 254 666',
    email: 'stay@khyberresort.com',
    commissionRate: 12,
    notes: 'Direct walking distance to Gondola Phase 1. Winter rates locked at ₹22,000/night for deluxe mountain-view rooms. Free airport pickup on 3+ night bookings.',
    roomTypes: [
      { name: 'Premier Mountain View', pricePerNight: 22000, inclusions: 'Buffet Breakfast & Gondola Transfer', capacity: 2 },
      { name: 'Luxury Heritage Cottage', pricePerNight: 35000, inclusions: 'All Meals, Heated Pool & Spa Access', capacity: 4 },
    ],
    photos: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    name: 'Taj Holiday Village Resort & Spa',
    city: 'Goa',
    address: 'Sinquerim Beach, Candolim, Bardez, North Goa',
    stars: 5,
    pricePerNight: 14500,
    currency: 'INR',
    phone: '+91 832 664 5858',
    email: 'village.goa@tajhotels.com',
    commissionRate: 18,
    notes: 'Beachfront cottages. Monsoon package special: Stay 3 Pay 2. Contact: Rohit Verma (Key Accounts).',
    roomTypes: [
      { name: 'Garden View Cottage', pricePerNight: 14500, inclusions: 'Daily Breakfast & Free Wi-Fi', capacity: 2 },
      { name: 'Sunset Beachfront Villa', pricePerNight: 26000, inclusions: 'Breakfast, Sunset Cruise & Airport Cab', capacity: 3 },
    ],
    photos: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

// Helper to format Mongoose document to frontend-compatible Hotel object
const formatHotel = (doc: IHotel) => {
  const obj = doc.toObject();
  return {
    ...obj,
    id: doc._id.toString(),
    _id: undefined,
    roomTypes: (doc.roomTypes || []).map((r: any) => ({
      ...r,
      id: r._id ? r._id.toString() : undefined,
      _id: undefined,
    })),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
};

// 1. GET ALL HOTELS (with search & filters)
export const getHotels = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    // Auto-seed default hotels if directory is empty for this organization
    const count = await Hotel.countDocuments({ organizationId, status: { $ne: 'ARCHIVED' } });
    if (count === 0) {
      await Hotel.insertMany(
        DEFAULT_HOTEL_SEEDS.map((seed) => ({
          ...seed,
          organizationId,
          createdBy: req.user?.userId,
          status: 'ACTIVE',
        }))
      );
    }

    const { search, city, stars } = req.query;
    const query: any = { organizationId, status: { $ne: 'ARCHIVED' } };

    if (city && city !== 'All') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    if (stars && stars !== 'All') {
      query.stars = Number(stars);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { city: searchRegex },
        { address: searchRegex },
        { notes: searchRegex },
      ];
    }

    const hotels = await Hotel.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      hotels: hotels.map(formatHotel),
      total: hotels.length,
    });
  } catch (error: any) {
    console.error('[Get Hotels Error]:', error);
    res.status(500).json({ error: error.message || 'Error fetching hotels' });
  }
};

// 2. GET SINGLE HOTEL BY ID
export const getHotelById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { id } = req.params;

    const hotel = await Hotel.findOne({ _id: id, organizationId, status: { $ne: 'ARCHIVED' } });
    if (!hotel) {
      res.status(404).json({ error: 'Hotel not found' });
      return;
    }

    res.status(200).json({ hotel: formatHotel(hotel) });
  } catch (error: any) {
    console.error('[Get Hotel By ID Error]:', error);
    res.status(500).json({ error: error.message || 'Error fetching hotel details' });
  }
};

// 3. CREATE NEW HOTEL
export const createHotel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.userId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const {
      name,
      city,
      address,
      stars,
      pricePerNight,
      currency,
      phone,
      email,
      notes,
      commissionRate,
      contractExpiry,
      roomTypes,
      photos,
    } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ error: 'Hotel name is required' });
      return;
    }

    if (!city?.trim()) {
      res.status(400).json({ error: 'City is required' });
      return;
    }

    const newHotel = await Hotel.create({
      organizationId,
      createdBy: userId,
      name: name.trim(),
      city: city.trim(),
      address: address?.trim() || '',
      stars: Math.min(5, Math.max(1, Number(stars) || 3)),
      pricePerNight: Math.max(0, Number(pricePerNight) || 0),
      currency: currency?.trim() || 'INR',
      phone: phone?.trim() || '',
      email: email?.trim().toLowerCase() || '',
      notes: notes?.trim() || '',
      commissionRate: Math.min(100, Math.max(0, Number(commissionRate) || 0)),
      contractExpiry: contractExpiry ? new Date(contractExpiry) : undefined,
      roomTypes: Array.isArray(roomTypes)
        ? roomTypes.map((r: any) => ({
            name: r.name?.trim() || 'Standard Room',
            pricePerNight: Math.max(0, Number(r.pricePerNight) || 0),
            inclusions: r.inclusions?.trim() || '',
            capacity: Math.max(1, Number(r.capacity) || 2),
          }))
        : [],
      photos: Array.isArray(photos) ? photos : [],
      status: 'ACTIVE',
    });

    res.status(201).json({
      message: 'Hotel added to directory successfully',
      hotel: formatHotel(newHotel),
    });
  } catch (error: any) {
    console.error('[Create Hotel Error]:', error);
    res.status(500).json({ error: error.message || 'Error creating hotel' });
  }
};

// 4. UPDATE HOTEL
export const updateHotel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { id } = req.params;

    const hotel = await Hotel.findOne({ _id: id, organizationId });
    if (!hotel) {
      res.status(404).json({ error: 'Hotel not found or access denied' });
      return;
    }

    const {
      name,
      city,
      address,
      stars,
      pricePerNight,
      currency,
      phone,
      email,
      notes,
      commissionRate,
      contractExpiry,
      roomTypes,
      photos,
      status,
    } = req.body;

    if (name !== undefined) hotel.name = name.trim();
    if (city !== undefined) hotel.city = city.trim();
    if (address !== undefined) hotel.address = address.trim();
    if (stars !== undefined) hotel.stars = Math.min(5, Math.max(1, Number(stars) || 3));
    if (pricePerNight !== undefined) hotel.pricePerNight = Math.max(0, Number(pricePerNight) || 0);
    if (currency !== undefined) hotel.currency = currency.trim();
    if (phone !== undefined) hotel.phone = phone.trim();
    if (email !== undefined) hotel.email = email.trim().toLowerCase();
    if (notes !== undefined) hotel.notes = notes.trim();
    if (commissionRate !== undefined) hotel.commissionRate = Math.min(100, Math.max(0, Number(commissionRate) || 0));
    if (contractExpiry !== undefined) hotel.contractExpiry = contractExpiry ? new Date(contractExpiry) : undefined;
    if (roomTypes !== undefined && Array.isArray(roomTypes)) {
      hotel.roomTypes = roomTypes.map((r: any) => ({
        name: r.name?.trim() || 'Standard Room',
        pricePerNight: Math.max(0, Number(r.pricePerNight) || 0),
        inclusions: r.inclusions?.trim() || '',
        capacity: Math.max(1, Number(r.capacity) || 2),
      })) as any;
    }
    if (photos !== undefined && Array.isArray(photos)) hotel.photos = photos;
    if (status !== undefined && ['ACTIVE', 'ARCHIVED'].includes(status)) hotel.status = status;

    await hotel.save();

    res.status(200).json({
      message: 'Hotel updated successfully',
      hotel: formatHotel(hotel),
    });
  } catch (error: any) {
    console.error('[Update Hotel Error]:', error);
    res.status(500).json({ error: error.message || 'Error updating hotel' });
  }
};

// 5. DELETE HOTEL (or Archive)
export const deleteHotel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { id } = req.params;

    const result = await Hotel.findOneAndDelete({ _id: id, organizationId });
    if (!result) {
      res.status(404).json({ error: 'Hotel not found or already deleted' });
      return;
    }

    res.status(200).json({
      message: 'Hotel removed from directory successfully',
      id,
    });
  } catch (error: any) {
    console.error('[Delete Hotel Error]:', error);
    res.status(500).json({ error: error.message || 'Error deleting hotel' });
  }
};

// 6. GET DISTINCT CITIES
export const getHotelCities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const cities = await Hotel.find({ organizationId, status: { $ne: 'ARCHIVED' } }).distinct('city');

    res.status(200).json({ cities });
  } catch (error: any) {
    console.error('[Get Hotel Cities Error]:', error);
    res.status(500).json({ error: error.message || 'Error fetching hotel cities' });
  }
};
