import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  recordPayment,
  deleteInvoice,
} from '../controllers/invoiceController';

const router = Router();

router.use(authenticate);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.post('/:id/payments', recordPayment);
router.delete('/:id', deleteInvoice);

export default router;
