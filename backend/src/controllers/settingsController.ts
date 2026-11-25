import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Settings } from '../models/Settings';
import { Types } from 'mongoose';

const DEFAULT_SETTINGS = {
  channels: {
    whatsappConnected: false,
    instagramConnected: false,
    emailConnected: false,
    emailFromAddress: '',
    emailApiKey: '',
  },
  aiAgent: {
    tone: '',
    systemPrompt: '',
    keyFacts: '',
  },
  automation: {
    enabled: false,
    nudgeAfterHours: 48,
    nudgeMessage: '',
    logs: [],
  },
};

const formatSettings = (s: any) => ({
  id: s._id.toString(),
  channels: s.channels,
  aiAgent: s.aiAgent,
  automation: s.automation,
  updatedAt: s.updatedAt,
});

export const getSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    let settings = await Settings.findOne({ organizationId });

    if (!settings) {
      settings = await Settings.create({
        organizationId: new Types.ObjectId(organizationId),
        ...DEFAULT_SETTINGS,
      });
    }

    res.status(200).json(formatSettings(settings));
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateChannels = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    const { channels } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { organizationId },
      { $set: { channels } },
      { new: true, upsert: true }
    );

    res.status(200).json(formatSettings(settings));
  } catch (error: any) {
    console.error('Error updating channels:', error);
    res.status(500).json({ error: 'Failed to update channel settings' });
  }
};

export const updateAiAgent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    const { aiAgent } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { organizationId },
      { $set: { aiAgent } },
      { new: true, upsert: true }
    );

    res.status(200).json(formatSettings(settings));
  } catch (error: any) {
    console.error('Error updating AI Agent settings:', error);
    res.status(500).json({ error: 'Failed to update AI Agent settings' });
  }
};

export const updateAutomation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(400).json({ error: 'Organization ID is required' });
      return;
    }

    const { automation } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { organizationId },
      { $set: { automation } },
      { new: true, upsert: true }
    );

    res.status(200).json(formatSettings(settings));
  } catch (error: any) {
    console.error('Error updating automation settings:', error);
    res.status(500).json({ error: 'Failed to update automation settings' });
  }
};
