import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getLinkTree,
  updateLinkTree,
  addLink,
  deleteLink,
  toggleLink,
  getPublicLinkTree,
} from '../controllers/linkTreeController';

const router = Router();

// Public visitor bio endpoint
router.get('/public/:slug', getPublicLinkTree);

// Protected tenant endpoints
router.use(authenticate);

router.get('/', getLinkTree);
router.put('/', updateLinkTree);
router.post('/links', addLink);
router.delete('/links/:linkId', deleteLink);
router.patch('/links/:linkId/toggle', toggleLink);

export default router;
