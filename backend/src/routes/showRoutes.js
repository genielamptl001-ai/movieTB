import { Router } from 'express';
import { getShows } from '../controllers/showController.js';
const router = Router();
router.get('/', getShows);
export default router;
