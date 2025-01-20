import { Router, Request, Response } from 'express';
import UserController from '../controllers/User.controller';
import multer from 'multer';

const userRoutes = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

userRoutes.get('/getAll', async (req: Request, res: Response) => {
  await UserController.getAll(req, res);
});

userRoutes.get('/getTeachers', async (req: Request, res: Response) => {
  await UserController.getTeachers(req, res);
});

userRoutes.post('/getById', async (req: Request, res: Response) => {
  await UserController.getById(req, res);
});

userRoutes.post('/create', upload.single('image'), async (req: Request, res: Response) => {
  await UserController.create(req, res);
});

userRoutes.put('/update', async (req: Request, res: Response) => {
  await UserController.update(req, res);
});

userRoutes.put('/updateImage', upload.single('image'), async (req: Request, res: Response) => {
  await UserController.updateImage(req, res);
});



export default userRoutes;
