import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getBotFlows,
  getBotFlowById,
  createBotFlow,
  updateBotFlow,
  toggleBotFlow,
  deleteBotFlow,
} from '../controllers/botFlowController';

const router = Router();

// All routes require multi-tenant JWT authentication
router.use(authenticate);

router.get('/', getBotFlows);
router.get('/:id', getBotFlowById);
router.post('/', createBotFlow);
router.put('/:id', updateBotFlow);
router.patch('/:id/toggle', toggleBotFlow);
router.delete('/:id', deleteBotFlow);

export default router;
