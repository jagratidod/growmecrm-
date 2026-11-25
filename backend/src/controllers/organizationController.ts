import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../types';
import { Organization } from '../models/Organization';

// 1. GET CURRENT AGENCY BRANDING & SETTINGS
export const getOrganization = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const org = await Organization.findById(organizationId);

    if (!org) {
      res.status(404).json({ error: 'Organization workspace not found' });
      return;
    }

    if (!org.webhookApiKey) {
      org.webhookApiKey = 'whk_' + crypto.randomBytes(16).toString('hex');
      await org.save();
    }

    res.status(200).json({
      id: org._id.toString(),
      agencyName: org.name,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl,
      primaryColor: org.primaryColor,
      secondaryColor: org.secondaryColor,
      plan: org.plan,
      maxSeats: org.maxSeats,
      maxLeads: org.maxLeads,
      webhookApiKey: org.webhookApiKey,
      status: org.status,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching organization settings' });
  }
};

// 2. UPDATE AGENCY BRANDING & SETTINGS (Owner/Admin only)
export const updateOrganization = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { agencyName, name, logoUrl, primaryColor, secondaryColor } = req.body;

    const org = await Organization.findById(organizationId);
    if (!org) {
      res.status(404).json({ error: 'Organization workspace not found' });
      return;
    }

    if (agencyName || name) org.name = (agencyName || name).trim();
    if (logoUrl !== undefined) org.logoUrl = logoUrl;
    if (primaryColor) org.primaryColor = primaryColor;
    if (secondaryColor) org.secondaryColor = secondaryColor;

    await org.save();

    res.status(200).json({
      message: 'Organization branding updated successfully',
      organization: {
        id: org._id.toString(),
        agencyName: org.name,
        name: org.name,
        slug: org.slug,
        logoUrl: org.logoUrl,
        primaryColor: org.primaryColor,
        secondaryColor: org.secondaryColor,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating organization branding' });
  }
};
