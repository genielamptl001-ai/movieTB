import { Router } from 'express';
import {
  getDashboard,
  createMovie,
  deleteMovie,
  createShow,
  deleteShow
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Middleware strictly verifying admin role
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Administrator privileges required.' });
  }
  next();
}

// All admin routes require authentication and admin role
router.use(protect, requireAdmin);

// Dashboard data with seats left and booked tracking
router.get('/dashboard', getDashboard);

// Movie management
router.post('/movies', createMovie);
router.delete('/movies/:id', deleteMovie);

// Shows management
router.post('/shows', createShow);
router.delete('/shows/:id', deleteShow);

export default router;
