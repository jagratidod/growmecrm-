import { Router } from 'express';
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  changePackageStatus,
  deletePackage,
  getPublicPackage,
} from '../controllers/packageController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public customer brochure endpoint (No auth required)
router.get('/public/:agencySlug/:packageSlug', getPublicPackage);

// Protected CRM Endpoints
router.use(authenticate);

router.get('/', getPackages);
router.post('/', createPackage);
router.get('/:id', getPackageById);
router.put('/:id', updatePackage);
router.patch('/:id/status', changePackageStatus);
router.delete('/:id', deletePackage);

export default router;
