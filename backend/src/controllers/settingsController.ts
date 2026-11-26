import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Settings, invoiceDetailFields } from '../models/Settings';
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


export const getInvoiceDetail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOne({ organizationId: req.user!.organizationId }).select('invoiceDetail').lean();
    res.json({ invoiceDetail: settings?.invoiceDetail ?? {} });
  } catch {
    res.status(500).json({ error: 'Could not load invoice details.' });
  }
};

export const updateInvoiceDetail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const details = req.body.invoiceDetail;
    const fields = details && typeof details === 'object' && !Array.isArray(details) ? Object.keys(details) : [];
    if (!fields.length || fields.some((key) => !invoiceDetailFields.some((field) => field === key) ||
        typeof details[key] !== 'string' || details[key].length > (key === 'signatureImage' ? 2_000_000 : 4000))) {
      res.status(400).json({ error: 'Enter valid invoice details.' });
      return;
    }
    const updates = Object.fromEntries(fields.map((key) => [`invoiceDetail.${key}`, details[key]]));
    const settings = await Settings.findOneAndUpdate({ organizationId: req.user!.organizationId },
      { $set: updates }, { new: true, upsert: true, runValidators: true });
    res.json({ invoiceDetail: settings.invoiceDetail ?? {} });
  } catch {
    res.status(500).json({ error: 'Could not save invoice details.' });
  }
};
