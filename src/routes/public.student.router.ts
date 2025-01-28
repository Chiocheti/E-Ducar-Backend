import { Router, Request, Response } from 'express';
import PublicStudentController from '../controllers/Public.Student.controller';
import multer from 'multer';

const publicStudentRoutes = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

publicStudentRoutes.post('/login', async (req: Request, res: Response) => {
  await PublicStudentController.login(req, res);
});

publicStudentRoutes.post('/logout', async (req: Request, res: Response) => {
  await PublicStudentController.create(req, res);
});

publicStudentRoutes.post('/create', upload.single('image'), async (req: Request, res: Response) => {
  await PublicStudentController.create(req, res);
});

export default publicStudentRoutes;
