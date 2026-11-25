import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Campaign } from '../models/Campaign';
import { Types } from 'mongoose';

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

    const campaigns: any[] = await Campaign.find(query).sort({ createdAt: -1 });

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
    } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Campaign title is required' });
      return;
    }

    const campaign = await Campaign.create({
      organizationId: new Types.ObjectId(organizationId),
      title: title.trim(),
      channel,
      audience,
      message: message?.trim(),
      recipientCount: 0,
      sentAt: '',
      status: 'draft',
      openRate: '-',
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
