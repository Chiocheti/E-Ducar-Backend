import { Router, Request, Response } from 'express';
import CourseController from '../controllers/Course.controller';
import multer from 'multer';

const courseRoutes = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

courseRoutes.get('/getAll', async (req: Request, res: Response) => {
  await CourseController.getAll(req, res);
});

courseRoutes.post('/create', upload.single('image'), async (req: Request, res: Response) => {
  await CourseController.create(req, res);
});

courseRoutes.put('/update', async (req: Request, res: Response) => {
  await CourseController.update(req, res);
});

courseRoutes.put('/updateImage', upload.single('image'), async (req: Request, res: Response) => {
  await CourseController.updateImage(req, res);
});

export default courseRoutes;