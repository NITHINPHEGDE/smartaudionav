import { Router } from 'express';
import { getAudioGuides, uploadAudio, deleteAudio, getLanguages } from '../controllers/audioController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.get('/languages', getLanguages);
router.get('/sculpture/:sculptureId', getAudioGuides);
router.post('/upload', authenticate, requireAdmin, upload.single('audio'), uploadAudio);
router.delete('/:id', authenticate, requireAdmin, deleteAudio);
export default router;