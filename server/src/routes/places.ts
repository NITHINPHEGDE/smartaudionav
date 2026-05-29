import { Router } from 'express';
import { getPlaces, getPlace, createPlace, updatePlace, deletePlace } from '../controllers/placeController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.get('/', getPlaces);
router.get('/:id', getPlace);
router.post('/', authenticate, requireAdmin, upload.single('image'), createPlace);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), updatePlace);
router.delete('/:id', authenticate, requireAdmin, deletePlace);
export default router;