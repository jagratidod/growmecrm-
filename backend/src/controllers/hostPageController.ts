import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { HostPage, IHostPage } from '../models/HostPage';
import { Organization } from '../models/Organization';
import { TravelPackageModel, ITravelPackage } from '../models/Package';

// Default starter reviews for initial setup
const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Pooja Verma',
    rating: 5,
    quote: 'Our Kashmir trip with Treki was magical! Gulmarg gondola tickets and houseboat were seamless.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date(),
  },
  {
    id: 'rev-2',
    name: 'Rahul Singhania',
    rating: 5,
    quote: 'Best Bali itinerary ever. Nusa Penida speedboat tour was the highlight of our vacation.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date(),
  },
];

const formatHostPage = (doc: IHostPage) => {
  const obj = doc.toObject();
  return {
    ...obj,
    id: doc._id.toString(),
    _id: undefined,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
};

// 1. GET HOST PAGE FOR AUTHENTICATED TENANT
export const getHostPage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    let hostPage = await HostPage.findOne({ organizationId });

    // Auto-create initial host page if none exists
    if (!hostPage) {
      const org = await Organization.findById(organizationId);
      const slug = org?.slug || `agency-${Math.floor(1000 + Math.random() * 9000)}`;
      const websiteUrl = `https://joinetra.com/${slug}`;

      hostPage = await HostPage.create({
        organizationId,
        websiteSlug: slug,
        websiteUrl,
        bannerImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80',
        tagline: 'Handcrafted Journeys & Group Trips',
        aboutUs: `Welcome to ${org?.name || 'our agency'}! We craft unforgettable holiday experiences, custom tour packages, and guided expeditions.`,
        contact: {
          phone: '+91 98765 43210',
          email: 'hello@travelagency.com',
          address: 'Main Market Square, Tourism District',
          whatsapp: '+91 98765 43210',
          instagram: '@trekitravels',
        },
        reviews: DEFAULT_REVIEWS,
        isPublished: true,
      });
    }

    res.status(200).json({ hostPage: formatHostPage(hostPage) });
  } catch (error: any) {
    console.error('[Get HostPage Error]:', error);
    res.status(500).json({ error: error.message || 'Error fetching host page data' });
  }
};

// 2. UPDATE HOST PAGE DETAILS
export const updateHostPage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const {
      bannerImage,
      tagline,
      aboutUs,
      contact,
      isPublished,
      websiteSlug,
    } = req.body;

    let hostPage = await HostPage.findOne({ organizationId });

    if (!hostPage) {
      const org = await Organization.findById(organizationId);
      const slug = websiteSlug?.trim() || org?.slug || `agency-${Date.now()}`;
      hostPage = new HostPage({
        organizationId,
        websiteSlug: slug,
        websiteUrl: `https://joinetra.com/${slug}`,
      });
    }

    if (bannerImage !== undefined) hostPage.bannerImage = bannerImage;
    if (tagline !== undefined) hostPage.tagline = tagline.trim();
    if (aboutUs !== undefined) hostPage.aboutUs = aboutUs.trim();
    if (isPublished !== undefined) hostPage.isPublished = !!isPublished;

    if (contact) {
      hostPage.contact = {
        ...hostPage.contact,
        ...contact,
      };
    }

    if (websiteSlug && websiteSlug.trim() && websiteSlug.trim() !== hostPage.websiteSlug) {
      const cleanSlug = websiteSlug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-');
      // Check collision
      const collision = await HostPage.findOne({
        websiteSlug: cleanSlug,
        organizationId: { $ne: organizationId },
      });
      if (!collision) {
        hostPage.websiteSlug = cleanSlug;
        hostPage.websiteUrl = `https://joinetra.com/${cleanSlug}`;
      }
    }

    await hostPage.save();

    res.status(200).json({
      message: 'Host page updated successfully',
      hostPage: formatHostPage(hostPage),
    });
  } catch (error: any) {
    console.error('[Update HostPage Error]:', error);
    res.status(500).json({ error: error.message || 'Error updating host page' });
  }
};

// 3. ADD REVIEW TO HOST PAGE
export const addReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const { name, rating, quote, avatarUrl } = req.body;

    if (!name?.trim() || !quote?.trim()) {
      res.status(400).json({ error: 'Reviewer name and quote are required' });
      return;
    }

    let hostPage = await HostPage.findOne({ organizationId });
    if (!hostPage) {
      res.status(404).json({ error: 'Host page not initialized' });
      return;
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      quote: quote.trim(),
      avatarUrl: avatarUrl?.trim() || '',
      createdAt: new Date(),
    };

    hostPage.reviews.unshift(newReview);
    await hostPage.save();

    res.status(201).json({
      message: 'Review added successfully',
      review: newReview,
      hostPage: formatHostPage(hostPage),
    });
  } catch (error: any) {
    console.error('[Add Review Error]:', error);
    res.status(500).json({ error: error.message || 'Error adding review' });
  }
};

// 4. DELETE REVIEW FROM HOST PAGE
export const deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { reviewId } = req.params;

    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const hostPage = await HostPage.findOne({ organizationId });
    if (!hostPage) {
      res.status(404).json({ error: 'Host page not found' });
      return;
    }

    hostPage.reviews = hostPage.reviews.filter((r) => r.id !== reviewId);
    await hostPage.save();

    res.status(200).json({
      message: 'Review removed successfully',
      hostPage: formatHostPage(hostPage),
    });
  } catch (error: any) {
    console.error('[Delete Review Error]:', error);
    res.status(500).json({ error: error.message || 'Error deleting review' });
  }
};

// 5. PUBLIC VISITOR VIEW (Unauthenticated)
export const getPublicHostPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    if (!slug) {
      res.status(400).json({ error: 'Website slug is required' });
      return;
    }

    const slugParam = Array.isArray(slug) ? slug[0] : slug;
    const cleanSlug = String(slugParam).toLowerCase().trim();
    let hostPage = await HostPage.findOne({ websiteSlug: cleanSlug });

    // Fallback: check by Organization slug if HostPage not found directly
    if (!hostPage) {
      const org = await Organization.findOne({ slug: cleanSlug });
      if (org) {
        hostPage = await HostPage.findOne({ organizationId: org._id });
      }
    }

    if (!hostPage) {
      res.status(404).json({ error: 'Travel agency website not found' });
      return;
    }

    // Atomically increment views count
    await HostPage.updateOne({ _id: hostPage._id }, { $inc: { viewCount: 1 } });

    // Fetch tenant organization branding
    const org = await Organization.findById(hostPage.organizationId);

    // Fetch published packages for this agency
    const packages = await TravelPackageModel.find({
      organizationId: hostPage.organizationId,
      status: 'PUBLISHED',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      agency: {
        name: org?.name || 'Travel Agency',
        logoUrl: org?.logoUrl || '',
        primaryColor: org?.primaryColor || '#453372',
        secondaryColor: org?.secondaryColor || '#0D9488',
        slug: org?.slug || hostPage.websiteSlug,
      },
      hostPage: formatHostPage(hostPage),
      packages: packages.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        destination: p.destination,
        price: p.price,
        originalPrice: p.originalPrice,
        currency: p.currency,
        duration: p.duration,
        bannerImage: p.bannerImage,
        categories: p.categories,
        itineraryDaysCount: p.itineraryDays?.length || 0,
      })),
    });
  } catch (error: any) {
    console.error('[Get Public HostPage Error]:', error);
    res.status(500).json({ error: error.message || 'Error loading public host page' });
  }
};
