import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  changeLeadStage,
  addLeadActivity,
  importLeads,
  deleteLead,
} from '../controllers/leadController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All routes require authenticated tenant user
router.use(authenticate);

// Leads collection
router.get('/', getLeads);
router.post('/', createLead);
router.post('/import', importLeads);

// Individual lead
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.patch('/:id/stage', changeLeadStage);
router.post('/:id/activities', addLeadActivity);
router.delete('/:id', deleteLead);

export default router;
