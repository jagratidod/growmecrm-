import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getCallLogs,
  logCall,
  deleteCallLog,
} from '../controllers/callLogController';

const router = Router();

router.use(authenticate);

router.get('/', getCallLogs);
router.post('/', logCall);
router.delete('/:id', deleteCallLog);

export default router;
