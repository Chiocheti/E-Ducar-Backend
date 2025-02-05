import { Router, Request, Response } from 'express';
import authenticate from '../middlewares/auth';
import RegistrationController from '../controllers/Registration.controller';

const registrationRoutes = Router();

registrationRoutes.post('/create', async (req: Request, res: Response) => {
  await RegistrationController.create(req, res);
});

export default registrationRoutes;
