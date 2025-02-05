import { Router, Request, Response } from 'express';
import AuthAdmController from '../controllers/Auth.Adm.controller';
import authenticate from '../middlewares/auth';

const authAdmRoutes = Router();

authAdmRoutes.put('/login', async (req: Request, res: Response) => {
  await AuthAdmController.login(req, res);
});

authAdmRoutes.put('/logout', authenticate, async (req: Request, res: Response) => {
  await AuthAdmController.logout(req, res);
});

export default authAdmRoutes;
