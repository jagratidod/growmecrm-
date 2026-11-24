import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { LinkTree, IBioLinkItem } from '../models/LinkTree';
import { Organization } from '../models/Organization';
import { Types } from 'mongoose';

const DEFAULT_STARTER_LINKS: IBioLinkItem[] = [
  {
    id: 'l-1',
    title: '💬 Chat on WhatsApp for Instant Itinerary',
    url: 'https://wa.me/919876543210',
    icon: 'whatsapp',
    active: true,
  },
  {
    id: 'l-2',
    title: '🏔️ Kashmir Winter Wonderland 5D/4N',
    url: 'https://joinetra.com/treki-travels/kashmir-winter',
    icon: 'package',
    active: true,
  },
  {
    id: 'l-3',
    title: '🏖️ Goa Private Beach Villas',
    url: 'https://joinetra.com/treki-travels/goa-luxury',
    icon: 'package',
    active: true,
  },
  {
    id: 'l-4',
    title: '⭐ Read Google Reviews (4.9 / 5)',
    url: 'https://maps.google.com',
    icon: 'review',
    active: true,
  },
  {
    id: 'l-5',
    title: '🌐 Visit Our Official Website',
    url: 'https://joinetra.com/treki-travels',
    icon: 'web',
    active: true,
  },
];

const formatLinkTree = (lt: any) => ({
  id: lt._id.toString(),
  bioTitle: lt.bioTitle,
  bioTagline: lt.bioTagline,
  links: lt.links || [],
  updatedAt: lt.updatedAt,
});

export const getLinkTree = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    let linkTree = await LinkTree.findOne({ organizationId });

    if (!linkTree) {
      // Find org name if available
      const org = await Organization.findById(organizationId);
      const defaultTitle = org?.name || 'Treki Travels';

      linkTree = await LinkTree.create({
        organizationId: new Types.ObjectId(organizationId),
        bioTitle: defaultTitle,
        bioTagline: 'Curated Trips, Himalayan Treks & Luxury Getaways ✨',
        links: DEFAULT_STARTER_LINKS,
      });
    }

    res.status(200).json(formatLinkTree(linkTree));
  } catch (error: any) {
    console.error('Error fetching LinkTree:', error);
    res.status(500).json({ error: 'Failed to fetch LinkTree configuration' });
  }
};

export const updateLinkTree = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    const { bioTitle, bioTagline, links } = req.body;

    const updateData: any = {};
    if (bioTitle !== undefined) updateData.bioTitle = bioTitle.trim();
    if (bioTagline !== undefined) updateData.bioTagline = bioTagline.trim();
    if (Array.isArray(links)) updateData.links = links;

    const linkTree = await LinkTree.findOneAndUpdate(
      { organizationId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json(formatLinkTree(linkTree));
  } catch (error: any) {
    console.error('Error updating LinkTree:', error);
    res.status(500).json({ error: 'Failed to update LinkTree' });
  }
};

export const addLink = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    const { title, url, icon = 'web', active = true } = req.body;

    if (!title || !url) {
      res.status(400).json({ error: 'Title and URL are required' });
      return;
    }

    const newLink: IBioLinkItem = {
      id: `l-${Date.now()}`,
      title: title.trim(),
      url: url.trim(),
      icon,
      active,
    };

    const linkTree = await LinkTree.findOneAndUpdate(
      { organizationId },
      { $push: { links: newLink } },
      { new: true, upsert: true }
    );

    res.status(200).json({ newLink, linkTree: formatLinkTree(linkTree) });
  } catch (error: any) {
    console.error('Error adding link:', error);
    res.status(500).json({ error: 'Failed to add link' });
  }
};

export const deleteLink = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { linkId } = req.params;

    const linkTree = await LinkTree.findOneAndUpdate(
      { organizationId },
      { $pull: { links: { id: linkId } } },
      { new: true }
    );

    if (!linkTree) {
      res.status(404).json({ error: 'LinkTree not found' });
      return;
    }

    res.status(200).json(formatLinkTree(linkTree));
  } catch (error: any) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
};

export const toggleLink = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { linkId } = req.params;

    const linkTree = await LinkTree.findOne({ organizationId });
    if (!linkTree) {
      res.status(404).json({ error: 'LinkTree not found' });
      return;
    }

    const target = linkTree.links.find((l) => l.id === linkId);
    if (!target) {
      res.status(404).json({ error: 'Link item not found' });
      return;
    }

    target.active = !target.active;
    await linkTree.save();

    res.status(200).json(formatLinkTree(linkTree));
  } catch (error: any) {
    console.error('Error toggling link:', error);
    res.status(500).json({ error: 'Failed to toggle link' });
  }
};

// Public visitor bio link endpoint (no auth required)
export const getPublicLinkTree = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug;
    if (!slug) {
      res.status(400).json({ error: 'Agency slug is required' });
      return;
    }

    const slugStr = Array.isArray(slug) ? slug[0] : String(slug);

    // Try finding organization by slug, direct ID, or name match
    let org: any = null;
    if (Types.ObjectId.isValid(slugStr)) {
      org = await Organization.findById(slugStr);
    }
    if (!org) {
      org = await Organization.findOne({ slug: slugStr.toLowerCase() });
    }
    if (!org) {
      const cleanName = slugStr.replace(/-/g, ' ');
      org = await Organization.findOne({
        name: { $regex: new RegExp(`^${cleanName}$`, 'i') },
      });
    }

    let linkTree: any = null;
    if (org) {
      linkTree = await LinkTree.findOne({ organizationId: org._id });
      if (!linkTree) {
        linkTree = await LinkTree.create({
          organizationId: org._id,
          bioTitle: org.name || 'Treki Travels',
          bioTagline: 'Curated Trips, Himalayan Treks & Luxury Getaways ✨',
          links: DEFAULT_STARTER_LINKS,
        });
      }
    }

    if (!linkTree) {
      res.status(404).json({ error: 'Bio page not found' });
      return;
    }

    // Only return active links for public visitors
    const activeLinks = (linkTree.links || []).filter((l: IBioLinkItem) => l.active);

    res.status(200).json({
      agencyName: org?.name || linkTree.bioTitle,
      bioTitle: linkTree.bioTitle,
      bioTagline: linkTree.bioTagline,
      links: activeLinks,
    });
  } catch (error: any) {
    console.error('Error fetching public bio link:', error);
    res.status(500).json({ error: 'Failed to load public bio page' });
  }
};
