import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getCampaigns,
  createCampaign,
  deleteCampaign,
} from '../controllers/campaignController';

const router = Router();

router.use(authenticate);

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.delete('/:id', deleteCampaign);

export default router;
