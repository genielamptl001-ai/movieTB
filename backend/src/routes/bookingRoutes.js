import { Router } from 'express';
import { createBooking, getMyBookings } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
const router = Router();
router.use(protect);
router.get('/my', getMyBookings);
router.post('/', createBooking);
export default router;
