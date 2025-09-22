import { Response, Request, Router } from 'express';

import CollaboratorController from '../controllers/Collaborator.controller';
import authenticate from '../middlewares/auth';

const collaboratorRoutes = Router();

collaboratorRoutes.get(
  '/',
  authenticate,
  async (req: Request, res: Response) => {
    await CollaboratorController.getAll(req, res);
  },
);

collaboratorRoutes.put(
  '/',
  authenticate,
  async (req: Request, res: Response) => {
    await CollaboratorController.update(req, res);
  },
);

export default collaboratorRoutes;
