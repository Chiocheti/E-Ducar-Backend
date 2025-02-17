import { Router, Request, Response } from 'express';
import RegistrationController from '../controllers/Registration.controller';
import authenticate from '../middlewares/auth';

const registrationRoutes = Router();

registrationRoutes.post('/create', authenticate, async (req: Request, res: Response) => {
  await RegistrationController.create(req, res);
});

export default registrationRoutes;
