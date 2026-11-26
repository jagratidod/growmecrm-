import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  changeLeadStage,
  addLeadActivity,
  importLeads,
  setLeadArchived,
} from '../controllers/leadController';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

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
router.patch('/:id/archive', authorizeRoles('OWNER', 'ADMIN', 'MANAGER'), setLeadArchived);
router.delete('/:id', authorizeRoles('OWNER', 'ADMIN', 'MANAGER'), setLeadArchived);

export default router;
