import { websiteHandler } from '../platform/websiteDatabase';
import { LinkTreeSchema, IBioLinkItem } from '../models/LinkTree';
import { Organization } from '../models/Organization';
import { Types } from 'mongoose';

const formatLinkTree = (lt: any) => ({
  id: lt._id.toString(),
  bioTitle: lt.bioTitle,
  bioTagline: lt.bioTagline,
  links: lt.links || [],
  updatedAt: lt.updatedAt,
});

export const getLinkTree = websiteHandler('LinkTree', LinkTreeSchema, async (req, res, LinkTree, organizationId) => {
  try {
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    let linkTree = await LinkTree.findOne({ organizationId });

    if (!linkTree) {
      // Find org name if available
      const org = await Organization.findById(organizationId);
      const defaultTitle = org?.name || 'GrowMe CRM';

      linkTree = await LinkTree.create({
        organizationId: new Types.ObjectId(organizationId),
        bioTitle: defaultTitle,
        bioTagline: '',
        links: [],
      });
    }

    const base = process.env.HOSTED_WEBSITE_BASE_URL?.trim().replace(/\/+$/, '');
    const organization = base ? await Organization.findById(organizationId).select('slug') : null;
    const publicUrl = organization ? `${base}/bio/${encodeURIComponent(organization.slug)}` : '';
    res.status(200).json({ ...formatLinkTree(linkTree), publicUrl });
  } catch (error: any) {
    console.error('Error fetching LinkTree:', error);
    res.status(500).json({ error: 'Failed to fetch LinkTree configuration' });
  }
});

export const updateLinkTree = websiteHandler('LinkTree', LinkTreeSchema, async (req, res, LinkTree, organizationId) => {
  try {
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
});

export const addLink = websiteHandler('LinkTree', LinkTreeSchema, async (req, res, LinkTree, organizationId) => {
  try {
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
});

export const deleteLink = websiteHandler('LinkTree', LinkTreeSchema, async (req, res, LinkTree, organizationId) => {
  try {
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
});

export const toggleLink = websiteHandler('LinkTree', LinkTreeSchema, async (req, res, LinkTree, organizationId) => {
  try {
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
});

// Public visitor bio link endpoint (no auth required)
export const getPublicLinkTree = websiteHandler('LinkTree', LinkTreeSchema, async (_req, res, LinkTree, organizationId) => {
  try {
    const org = await Organization.findById(organizationId);
    const linkTree = await LinkTree.findOne({ organizationId });
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
}, true);
