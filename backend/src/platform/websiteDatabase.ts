import { Response } from 'express';
import { Model, Schema } from 'mongoose';
import { Organization } from '../models/Organization';
import { AuthenticatedRequest } from '../types';
import { withClientWebsiteDatabase, mediaCredentials, requireWebsiteServices } from './connections';
import { Workspace } from './models';

export function websiteHandler<T>(
  name: string,
  schema: Schema<T>,
  handle: (req: AuthenticatedRequest, res: Response, model: Model<T>, organizationId: string) => Promise<void>,
  isPublic = false,
) {
  return async (req: AuthenticatedRequest, res: Response) => {
    try {
      const slug = String(req.params.slug ?? '').toLowerCase();
      const organization = isPublic
        ? await Organization.findOne({ slug, status: 'ACTIVE' }).select('_id').lean()
        : undefined;
      const organizationId = isPublic ? organization?._id.toString() : req.user?.organizationId;
      const settings = organizationId && await Workspace.findOne({ organizationId }).select('mongo cloudinary').lean();
      if (!organizationId || !settings || !settings.mongo || !settings.cloudinary) {
        res.status(isPublic ? 404 : 409).json({
          error: isPublic ? 'Website not found.' : 'Assign the client’s MongoDB and Cloudinary in Super Admin before managing website content.',
        });
        return;
      }
      requireWebsiteServices(settings);
      res.locals.websiteCloud = mediaCredentials(settings);
      await withClientWebsiteDatabase(settings, (connection) =>
        handle(req, res, connection.model<T>(name, schema), organizationId));
    } catch {
      if (!res.headersSent) res.status(503).json({ error: 'The client’s website database is unavailable.' });
    }
  };
}
