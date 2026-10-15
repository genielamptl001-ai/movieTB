import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Enter a valid email.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
], register);
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login);
router.get('/me', protect, me);
export default router;
