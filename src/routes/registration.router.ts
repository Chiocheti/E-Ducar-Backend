import { Router, Request, Response, NextFunction } from 'express';

import RegistrationController from '../controllers/Registration.controller';
import authenticate from '../middlewares/auth';

const registrationRoutes = Router();

registrationRoutes.get(
  '/id/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    await RegistrationController.getById(req, res, next);
  },
);

registrationRoutes.get(
  '/id/:id/lessonProgress',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    await RegistrationController.getByIdLessonProgress(req, res, next);
  },
);

registrationRoutes.get(
  '/id/:id/exam',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    await RegistrationController.getByIdExam(req, res, next);
  },
);

registrationRoutes.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    await RegistrationController.create(req, res, next);
  },
);

registrationRoutes.put(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    await RegistrationController.updateLessonProgress(req, res, next);
  },
);

registrationRoutes.put(
  '/finish',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    await RegistrationController.finishCourse(req, res, next);
  },
);

registrationRoutes.delete(
  '/',
  authenticate,
  async (req: Request, res: Response) => {
    await RegistrationController.delete(req, res);
  },
);

export default registrationRoutes;
