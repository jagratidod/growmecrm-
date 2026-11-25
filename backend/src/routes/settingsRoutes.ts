import { requireModule } from '../platform/access';
import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getSettings,
  updateChannels,
  updateAiAgent,
  updateAutomation,
} from '../controllers/settingsController';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.put('/channels', requireModule('communications'), updateChannels);
router.put('/ai-agent', requireModule('communications'), updateAiAgent);
router.put('/automation', requireModule('communications'), updateAutomation);

export default router;
