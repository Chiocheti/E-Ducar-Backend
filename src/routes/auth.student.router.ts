import { Router, Request, Response } from 'express';

import AuthStudentController from '../controllers/Auth.Student.controller';
import authenticate from '../middlewares/auth';

const authStudentRoutes = Router();

authStudentRoutes.post('/login', async (req: Request, res: Response) => {
  await AuthStudentController.login(req, res);
});

authStudentRoutes.post(
  '/logout',
  authenticate,
  async (req: Request, res: Response) => {
    await AuthStudentController.logout(req, res);
  },
);

export default authStudentRoutes;
