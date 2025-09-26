import { Router, Request, Response } from 'express';
import multer from 'multer';

import CourseController from '../controllers/Course.controller';
import authenticate from '../middlewares/auth';

const courseRoutes = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

courseRoutes.get('/', authenticate, async (req: Request, res: Response) => {
  await CourseController.getAll(req, res);
});

courseRoutes.get(
  '/details',
  authenticate,
  async (req: Request, res: Response) => {
    await CourseController.getAllDetails(req, res);
  },
);

courseRoutes.get('/open', async (req: Request, res: Response) => {
  await CourseController.getOpen(req, res);
});

courseRoutes.get('/open/details', async (req: Request, res: Response) => {
  await CourseController.getOpen(req, res);
});

courseRoutes.get(
  '/id/:id',
  authenticate,
  async (req: Request, res: Response) => {
    await CourseController.getById(req, res);
  },
);

courseRoutes.get(
  '/id/:id/details',
  authenticate,
  async (req: Request, res: Response) => {
    await CourseController.getByIdDetails(req, res);
  },
);

courseRoutes.get('/name/:name', async (req: Request, res: Response) => {
  await CourseController.getByName(req, res);
});

courseRoutes.post(
  '/',
  authenticate,
  upload.fields([
    {
      name: 'image',
      maxCount: 1,
    },
    {
      name: 'documents',
    },
  ]),
  async (req: Request, res: Response) => {
    await CourseController.create(req, res);
  },
);

courseRoutes.put('/', authenticate, async (req: Request, res: Response) => {
  await CourseController.update(req, res);
});

courseRoutes.put(
  '/materials',
  authenticate,
  upload.fields([{ name: 'documents' }]),
  async (req: Request, res: Response) => {
    await CourseController.updateMaterials(req, res);
  },
);

courseRoutes.put(
  '/image',
  authenticate,
  upload.single('image'),
  async (req: Request, res: Response) => {
    await CourseController.updateImage(req, res);
  },
);

export default courseRoutes;
