import { Router, Request, Response } from 'express';
import UserController from '../controllers/User.controller';
import multer from 'multer';
import authenticate from '../middlewares/auth';

const userRoutes = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

userRoutes.get('/getAll', authenticate, async (req: Request, res: Response) => {
  await UserController.getAll(req, res);
});

userRoutes.get('/getTeachers', authenticate, async (req: Request, res: Response) => {
  await UserController.getTeachers(req, res);
});

userRoutes.post('/getById', authenticate, async (req: Request, res: Response) => {
  await UserController.getById(req, res);
});

userRoutes.post('/create', authenticate, upload.single('image'), async (req: Request, res: Response) => {
  await UserController.create(req, res);
});

userRoutes.put('/update', authenticate, async (req: Request, res: Response) => {
  await UserController.update(req, res);
});

userRoutes.put('/updateImage', authenticate, upload.single('image'), async (req: Request, res: Response) => {
  await UserController.updateImage(req, res);
});

export default userRoutes;
