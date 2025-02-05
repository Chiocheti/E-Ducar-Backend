import { Router, Request, Response } from 'express';
import CourseController from '../controllers/Course.controller';
import multer from 'multer';
import authenticate from '../middlewares/auth';

const courseRoutes = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

courseRoutes.get('/getAll', authenticate, async (req: Request, res: Response) => {
  await CourseController.getAll(req, res);
});

courseRoutes.get('/getOpen', async (req: Request, res: Response) => {
  await CourseController.getOpen(req, res);
});

courseRoutes.post('/create', authenticate, upload.single('image'), async (req: Request, res: Response) => {
  await CourseController.create(req, res);
});

courseRoutes.put('/update', authenticate, async (req: Request, res: Response) => {
  await CourseController.update(req, res);
});

courseRoutes.put('/updateImage', authenticate, upload.single('image'), async (req: Request, res: Response) => {
  await CourseController.updateImage(req, res);
});

export default courseRoutes;