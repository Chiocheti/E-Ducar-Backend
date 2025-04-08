import { Response, Request } from "express";
import { Router } from "express";
import authenticate from "../middlewares/auth";

import TicketController from "../controllers/Ticket.controller";

const ticketRoutes = Router();

ticketRoutes.post(
  "/create",
  authenticate,
  async (req: Request, res: Response) => {
    await TicketController.createTickets(req, res);
  }
);

export default ticketRoutes;
