import { Router, Request, Response } from 'express';
import UserController from '../controllers/User.controller';

const userRoutes = Router();

userRoutes.get('/getAll', async (req: Request, res: Response) => {
  await UserController.getAll(req, res);
});

userRoutes.get('/getTeachers', async (req: Request, res: Response) => {
  await UserController.getTeachers(req, res);
});

userRoutes.post('/create', async (req: Request, res: Response) => {
  await UserController.create(req, res);
});

userRoutes.put('/update', async (req: Request, res: Response) => {
  await UserController.update(req, res);
});

export default userRoutes;
