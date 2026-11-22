import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { TravelPackageModel, ITravelPackage } from '../models/Package';
import { Organization } from '../models/Organization';

// Helper to format Mongoose document to frontend-compatible TravelPackage
const formatPackage = (doc: ITravelPackage) => {
  const obj = doc.toObject();
  return {
    ...obj,
    id: doc._id.toString(),
    _id: undefined,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
};

// 1. GET ALL PACKAGES FOR CURRENT TENANT
export const getPackages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const { search, status } = req.query;

    const query: any = { organizationId };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } },
        { categories: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const packages = await TravelPackageModel.find(query).sort({ updatedAt: -1 });
    res.status(200).json(packages.map(formatPackage));
  } catch (error: any) {
    console.error('getPackages error:', error);
    res.status(500).json({ error: error.message || 'Error fetching packages' });
  }
};

// 2. GET SINGLE PACKAGE BY ID
export const getPackageById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const pkg = await TravelPackageModel.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (!pkg) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }

    res.status(200).json(formatPackage(pkg));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching package' });
  }
};

// 3. CREATE NEW PACKAGE
export const createPackage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const body = req.body;

    if (!body.name?.trim() || !body.destination?.trim() || body.price === undefined) {
      res.status(400).json({ error: 'Package name, destination, and price are required.' });
      return;
    }

    // Auto-generate clean slug if not provided
    let slug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check slug collision within the same organization
    const existing = await TravelPackageModel.findOne({ organizationId, slug });
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newPackage = await TravelPackageModel.create({
      ...body,
      organizationId,
      slug,
      name: body.name.trim(),
      destination: body.destination.trim(),
      price: Number(body.price),
      status: body.status || 'DRAFT',
    });

    res.status(201).json(formatPackage(newPackage));
  } catch (error: any) {
    console.error('createPackage error:', error);
    res.status(500).json({ error: error.message || 'Error creating package' });
  }
};

// 4. UPDATE EXISTING PACKAGE
export const updatePackage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const pkg = await TravelPackageModel.findOne({
      _id: req.params.id,
      organizationId,
    });

    if (!pkg) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }

    const updates = req.body;
    delete updates._id;
    delete updates.id;
    delete updates.organizationId;

    // Check slug collision if slug is being updated
    if (updates.slug && updates.slug !== pkg.slug) {
      const collision = await TravelPackageModel.findOne({
        organizationId,
        slug: updates.slug,
        _id: { $ne: pkg._id },
      });
      if (collision) {
        updates.slug = `${updates.slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    Object.assign(pkg, updates);
    await pkg.save();

    res.status(200).json(formatPackage(pkg));
  } catch (error: any) {
    console.error('updatePackage error:', error);
    res.status(500).json({ error: error.message || 'Error updating package' });
  }
};

// 5. CHANGE PACKAGE STATUS
export const changePackageStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      res.status(400).json({ error: 'Valid status must be DRAFT, PUBLISHED, or ARCHIVED' });
      return;
    }

    const pkg = await TravelPackageModel.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (!pkg) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }

    pkg.status = status;
    await pkg.save();

    res.status(200).json(formatPackage(pkg));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error changing package status' });
  }
};

// 6. DELETE PACKAGE
export const deletePackage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await TravelPackageModel.deleteOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Package not found or already deleted' });
      return;
    }

    res.status(200).json({ message: 'Package deleted successfully', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting package' });
  }
};

// 7. PUBLIC VIEW: GET PUBLISHED PACKAGE BY AGENCY SLUG & PACKAGE SLUG
export const getPublicPackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { agencySlug, packageSlug } = req.params;

    const organization = await Organization.findOne({ slug: agencySlug });
    if (!organization) {
      res.status(404).json({ error: 'Travel agency workspace not found' });
      return;
    }

    const pkg = await TravelPackageModel.findOne({
      organizationId: organization._id,
      slug: packageSlug,
      status: 'PUBLISHED',
    });

    if (!pkg) {
      res.status(404).json({ error: 'Published package not found' });
      return;
    }

    res.status(200).json({
      package: formatPackage(pkg),
      agency: {
        name: organization.name,
        logoUrl: organization.logoUrl,
        primaryColor: organization.primaryColor,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching public package' });
  }
};
