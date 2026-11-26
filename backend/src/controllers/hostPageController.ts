import { isClientImage } from '../platform/connections';
import { websiteHandler } from '../platform/websiteDatabase';
import { HostPageSchema, IHostPage } from '../models/HostPage';
import { Organization } from '../models/Organization';
import { TravelPackageModel, ITravelPackage } from '../models/Package';

const publicWebsiteUrl = (slug: string) => {
  const base = process.env.HOSTED_WEBSITE_BASE_URL?.trim().replace(/\/+$/, '');
  return base ? `${base}/${encodeURIComponent(slug)}` : '';
};

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
export const getHostPage = websiteHandler('HostPage', HostPageSchema, async (req, res, HostPage, organizationId) => {
  try {
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    let hostPage = await HostPage.findOne({ organizationId });

    // Auto-create initial host page if none exists
    if (!hostPage) {
      const org = await Organization.findById(organizationId);
      const slug = org?.slug || `agency-${Math.floor(1000 + Math.random() * 9000)}`;
      const websiteUrl = publicWebsiteUrl(slug);

      hostPage = await HostPage.create({
        organizationId,
        websiteSlug: slug,
        websiteUrl,
        bannerImage: '',
        tagline: '',
        aboutUs: '',
        contact: {},
        reviews: [],
        isPublished: false,
      });
    }

    res.status(200).json({ hostPage: formatHostPage(hostPage) });
  } catch (error: any) {
    console.error('[Get HostPage Error]:', error);
    res.status(500).json({ error: error.message || 'Error fetching host page data' });
  }
});

// 2. UPDATE HOST PAGE DETAILS
export const updateHostPage = websiteHandler('HostPage', HostPageSchema, async (req, res, HostPage, organizationId) => {
  try {
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
    } = req.body;

    let hostPage = await HostPage.findOne({ organizationId });

    if (!hostPage) {
      const org = await Organization.findById(organizationId);
      const slug = org?.slug || `agency-${Date.now()}`;
      hostPage = new HostPage({
        organizationId,
        websiteSlug: slug,
        websiteUrl: publicWebsiteUrl(slug),
      });
    }

    if (bannerImage !== undefined) {
      if (typeof bannerImage !== 'string' || !isClientImage(bannerImage, res.locals.websiteCloud.cloudName)) {
        res.status(400).json({ error: 'Use an image from the client’s assigned Cloudinary account.' });
        return;
      }
      hostPage.bannerImage = bannerImage;
    }
    if (tagline !== undefined) hostPage.tagline = tagline.trim();
    if (aboutUs !== undefined) hostPage.aboutUs = aboutUs.trim();
    if (isPublished !== undefined) hostPage.isPublished = !!isPublished;

    if (contact) {
      hostPage.contact = {
        ...hostPage.contact,
        ...contact,
      };
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
});

// 3. ADD REVIEW TO HOST PAGE
export const addReview = websiteHandler('HostPage', HostPageSchema, async (req, res, HostPage, organizationId) => {
  try {
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const { name, rating, quote, avatarUrl } = req.body;

    if (avatarUrl && (typeof avatarUrl !== 'string' || !isClientImage(avatarUrl, res.locals.websiteCloud.cloudName))) {
      res.status(400).json({ error: 'Use an image from the client’s assigned Cloudinary account.' });
      return;
    }
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
});

// 4. DELETE REVIEW FROM HOST PAGE
export const deleteReview = websiteHandler('HostPage', HostPageSchema, async (req, res, HostPage, organizationId) => {
  try {
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
});

// 5. PUBLIC VISITOR VIEW (Unauthenticated)
export const getPublicHostPage = websiteHandler('HostPage', HostPageSchema, async (_req, res, HostPage, organizationId) => {
  try {
    const hostPage = await HostPage.findOne({ organizationId });
    if (!hostPage?.isPublished) {
      res.status(404).json({ error: 'Travel agency website not found' });
      return;
    }

    // Atomically increment views count
    await HostPage.updateOne({ _id: hostPage._id }, { $inc: { viewCount: 1 } });

    // Fetch tenant organization branding
    const org = await Organization.findById(hostPage.organizationId);

    res.status(200).json({
      agency: {
        name: org?.name || 'Travel Agency',
        logoUrl: org?.logoUrl || '',
        primaryColor: org?.primaryColor || '#453372',
        secondaryColor: org?.secondaryColor || '#0D9488',
        slug: org?.slug || hostPage.websiteSlug,
      },
      hostPage: formatHostPage(hostPage),
      packages: [],
    });
  } catch (error: any) {
    console.error('[Get Public HostPage Error]:', error);
    res.status(500).json({ error: error.message || 'Error loading public host page' });
  }
}, true);
