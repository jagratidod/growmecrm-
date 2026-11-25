import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getConversations,
  getConversationById,
  createConversation,
  sendMessage,
  toggleFavourite,
  updateStage,
  deleteConversation,
} from '../controllers/inboxController';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversationById);
router.post('/:id/messages', sendMessage);
router.patch('/:id/favourite', toggleFavourite);
router.patch('/:id/stage', updateStage);
router.delete('/:id', deleteConversation);

export default router;
