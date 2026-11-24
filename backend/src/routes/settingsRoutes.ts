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
router.put('/channels', updateChannels);
router.put('/ai-agent', updateAiAgent);
router.put('/automation', updateAutomation);

export default router;
