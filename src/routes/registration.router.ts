import { Router, Request, Response } from "express";
import RegistrationController from "../controllers/Registration.controller";
import authenticate from "../middlewares/auth";

const registrationRoutes = Router();

registrationRoutes.post(
  "/getById",
  authenticate,
  async (req: Request, res: Response) => {
    await RegistrationController.getById(req, res);
  }
);

registrationRoutes.post(
  "/create",
  authenticate,
  async (req: Request, res: Response) => {
    await RegistrationController.create(req, res);
  }
);

registrationRoutes.post(
  "/createStudentAnswer",
  authenticate,
  async (req: Request, res: Response) => {
    await RegistrationController.createStudentAnswer(req, res);
  }
);

registrationRoutes.post(
  "/updateLessonProgress",
  authenticate,
  async (req: Request, res: Response) => {
    await RegistrationController.updateLessonProgress(req, res);
  }
);

export default registrationRoutes;
