import { Router } from 'express';
import userRoutes from './user.router';
import authRoutes from './auth.router';
import authenticate from '../middlewares/auth';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', authenticate, userRoutes);

export default router;
