import { Router, Request, Response } from 'express';
import CourseController from '../controllers/Course.controller';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const courseRoutes = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

courseRoutes.get('/getAll', async (req: Request, res: Response) => {
  await CourseController.getAll(req, res);
});

courseRoutes.post('/create', upload.single('image'), async (req: Request, res: Response) => {
  await CourseController.create(req, res);
});

export default courseRoutes;