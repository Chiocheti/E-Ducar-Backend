import { Router, Request, Response } from 'express';
import multer from 'multer';

import UserController from '../controllers/User.controller';
import authenticate from '../middlewares/auth';

const userRoutes = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

userRoutes.get('/', authenticate, async (req: Request, res: Response) => {
  await UserController.getAll(req, res);
});

userRoutes.get(
  '/teachers',
  authenticate,
  async (req: Request, res: Response) => {
    await UserController.getTeachers(req, res);
  },
);

userRoutes.get('/id/:id', authenticate, async (req: Request, res: Response) => {
  await UserController.getById(req, res);
});

userRoutes.post(
  '/',
  authenticate,
  upload.single('image'),
  async (req: Request, res: Response) => {
    await UserController.create(req, res);
  },
);

userRoutes.put('/', authenticate, async (req: Request, res: Response) => {
  await UserController.update(req, res);
});

userRoutes.put(
  '/image',
  authenticate,
  upload.single('image'),
  async (req: Request, res: Response) => {
    await UserController.updateImage(req, res);
  },
);

export default userRoutes;
