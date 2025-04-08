import { Response, Request } from "express";
import { Router } from "express";
import authenticate from "../middlewares/auth";
import CollaboratorController from "../controllers/Collaborator.controller";

const collaboratorRoutes = Router();

collaboratorRoutes.get(
  "/getAll",
  authenticate,
  async (req: Request, res: Response) => {
    await CollaboratorController.getAll(req, res);
  }
);

collaboratorRoutes.put(
  "/update",
  authenticate,
  async (req: Request, res: Response) => {
    await CollaboratorController.update(req, res);
  }
);

export default collaboratorRoutes;
