import { Router, Request, Response } from 'express';
import StudentController from "../controllers/Student.controller";
import authenticate from "../middlewares/auth";

const studentRoutes = Router();

studentRoutes.post("/getById", async (req: Request, res: Response) => {
  await StudentController.getById(req, res);
});

studentRoutes.post("/create", async (req: Request, res: Response) => {
  await StudentController.create(req, res);
});

export default studentRoutes;