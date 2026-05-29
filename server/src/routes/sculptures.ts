import { Router, Request, Response, NextFunction } from 'express';
import {
  getSculptures, getSculpture, getSculptureByQR,
  createSculpture, updateSculpture, deleteSculpture, regenerateQR
} from '../controllers/sculptureController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

const optionalMultipart = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.array('images', 10)(req, res, next);
  } else {
    next();
  }
};

router.get('/', getSculptures);
router.get('/qr/:qrValue', getSculptureByQR);
router.get('/:id', getSculpture);
router.post('/', authenticate, requireAdmin, optionalMultipart, createSculpture);
router.put('/:id', authenticate, requireAdmin, optionalMultipart, updateSculpture);
router.delete('/:id', authenticate, requireAdmin, deleteSculpture);
router.post('/:id/regenerate-qr', authenticate, requireAdmin, regenerateQR);

export default router;