import { Router } from 'express';
import userRoutes from './user.router';
import authAdmRoutes from './auth.adm.router';
import authStudentRoutes from './auth.student.router';
import courseRoutes from './course.router';
import registrationRoutes from './registration.router';
import studentRoutes from './student.router';

const router = Router();

router.use('/authAdm', authAdmRoutes);
router.use('/authStudent', authStudentRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/registrations', registrationRoutes);
router.use('/students', studentRoutes);

export default router;
