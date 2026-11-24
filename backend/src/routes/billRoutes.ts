import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getBills,
  getBillById,
  createBill,
  updateBill,
  recordPayment,
  deleteBill,
} from '../controllers/billController';

const router = Router();

router.use(authenticate);

router.get('/', getBills);
router.get('/:id', getBillById);
router.post('/', createBill);
router.put('/:id', updateBill);
router.post('/:id/payments', recordPayment);
router.delete('/:id', deleteBill);

export default router;
