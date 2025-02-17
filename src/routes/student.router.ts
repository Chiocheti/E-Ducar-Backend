import { Router, Request, Response } from 'express';
import StudentController from "../controllers/Student.controller";
import authenticate from "../middlewares/auth";
import multer from 'multer';

const studentRoutes = Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

studentRoutes.post("/getById", authenticate, async (req: Request, res: Response) => {
  await StudentController.getById(req, res);
});

studentRoutes.post("/create", async (req: Request, res: Response) => {
  await StudentController.create(req, res);
});

studentRoutes.put('/update', authenticate, async (req: Request, res: Response) => {
  await StudentController.update(req, res);
});

studentRoutes.put('/updateImage', authenticate, upload.single('image'), async (req: Request, res: Response) => {
  await StudentController.updateImage(req, res);
});

export default studentRoutes;