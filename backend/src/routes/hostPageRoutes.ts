import { requireModule } from '../platform/access';
import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';
import {
  getHostPage,
  updateHostPage,
  addReview,
  deleteReview,
  getPublicHostPage,
} from '../controllers/hostPageController';

import { mediaCredentials, requireWebsiteServices } from '../platform/connections';
import { Workspace } from '../platform/models';
import { uploadWebsiteImage, readWebsiteImage } from '../platform/websiteMedia';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Public unauthenticated route for external visitors & clients
router.get('/public/:slug', getPublicHostPage);

// Authenticated private routes for tenant host customization
router.post('/media', authenticate, requireModule('websites', 'media'), authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const settings = await Workspace.findOne({ organizationId: req.user?.organizationId }).select('mongo cloudinary').lean();
      requireWebsiteServices(settings);
      const credentials = mediaCredentials(settings);
      const file = await readWebsiteImage(req, res);
      res.json({ url: await uploadWebsiteImage(file, credentials, `growme/${req.user!.organizationId}/host-page`) });
    } catch (error) {
      next(error);
    }
  });
router.get('/', authenticate, requireModule('websites'), getHostPage);
router.put('/', authenticate, requireModule('websites'), updateHostPage);
router.post('/reviews', authenticate, requireModule('websites'), addReview);
router.delete('/reviews/:reviewId', authenticate, requireModule('websites'), deleteReview);

export default router;
