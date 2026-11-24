import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Campaign } from '../models/Campaign';
import { Types } from 'mongoose';

const DEFAULT_STARTER_CAMPAIGNS = [
  {
    title: 'Winter Holidays Flash Offer: Flat 15% Off Kashmir',
    channel: 'whatsapp',
    audience: 'All Leads (Proposal Sent)',
    message: 'Plan your magical winter escape to snow-clad Kashmir! Book this week to get flat 15% off.',
    recipientCount: 24,
    sentAt: '2026-11-18 03:30 PM',
    status: 'sent',
    openRate: '92%',
  },
  {
    title: 'New Year Goa Group Trip Early Bird Invitation',
    channel: 'whatsapp',
    audience: 'Active Inquiries',
    message: 'Celebrate New Year 2027 in North Goa! VIP party passes and beach resort included.',
    recipientCount: 18,
    sentAt: '2026-11-15 11:00 AM',
    status: 'sent',
    openRate: '88%',
  },
  {
    title: 'November Agency Newsletter & Trending Destinations',
    channel: 'email',
    audience: 'Past Travellers & Bookings',
    message: 'Explore this month top trending travel destinations, travel tips, and early bird discounts.',
    recipientCount: 65,
    sentAt: '2026-11-20 10:00 AM',
    status: 'scheduled',
    openRate: '-',
  },
];

const formatCampaign = (c: any) => ({
  id: c._id.toString(),
  title: c.title,
  channel: c.channel,
  audience: c.audience,
  message: c.message,
  recipientCount: c.recipientCount,
  sentAt: c.sentAt,
  status: c.status,
  openRate: c.openRate,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

export const getCampaigns = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    const { channel, status, search } = req.query;
    const query: any = { organizationId };

    if (channel && channel !== 'all') {
      query.channel = channel;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && typeof search === 'string') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { audience: regex }, { message: regex }];
    }

    let campaigns: any[] = await Campaign.find(query).sort({ createdAt: -1 });

    // Auto-seed starter campaigns if database is empty for this org
    if (campaigns.length === 0 && (!channel || channel === 'all') && !search) {
      const count = await Campaign.countDocuments({ organizationId });
      if (count === 0) {
        const seeded = await Campaign.insertMany(
          DEFAULT_STARTER_CAMPAIGNS.map((camp) => ({
            ...camp,
            organizationId: new Types.ObjectId(organizationId),
          }))
        );
        campaigns = seeded;
      }
    }

    res.status(200).json(campaigns.map(formatCampaign));
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

export const createCampaign = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    const {
      title,
      channel = 'whatsapp',
      audience = 'All Active Leads',
      message,
      recipientCount = 30,
      status = 'sent',
    } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Campaign title is required' });
      return;
    }

    const sentAt = new Date().toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const campaign = await Campaign.create({
      organizationId: new Types.ObjectId(organizationId),
      title: title.trim(),
      channel,
      audience,
      message: message?.trim(),
      recipientCount: Number(recipientCount) || 30,
      sentAt,
      status,
      openRate: status === 'sent' ? '100%' : '-',
    });

    res.status(201).json(formatCampaign(campaign));
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
};

export const deleteCampaign = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    const result = await Campaign.findOneAndDelete({ _id: id, organizationId });
    if (!result) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    res.status(200).json({ message: 'Campaign deleted successfully', id });
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
};
