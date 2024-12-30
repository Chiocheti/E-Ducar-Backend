import { Router } from 'express';
import userRoutes from './user.router';
import authRoutes from './auth.router';
import authenticate from '../middlewares/auth';
import courseRoutes from './course.router';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', authenticate, userRoutes);
router.use('/courses', authenticate, courseRoutes);

export default router;
