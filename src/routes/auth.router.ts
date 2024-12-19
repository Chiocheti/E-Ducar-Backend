import { Router, Request, Response } from 'express';
import AuthController from '../controllers/Auth.controller';
import authenticate from '../middlewares/auth';

const authRoutes = Router();

authRoutes.post('/login', async (req: Request, res: Response) => {
  await AuthController.login(req, res);
});

authRoutes.put('/logout', authenticate, async (req: Request, res: Response) => {
  await AuthController.logout(req, res);
});

export default authRoutes;
