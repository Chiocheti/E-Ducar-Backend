import { Response, Request, Router } from 'express';

import TicketController from '../controllers/Ticket.controller';
import authenticate from '../middlewares/auth';

const ticketRoutes = Router();

ticketRoutes.get('/', authenticate, async (req: Request, res: Response) => {
  await TicketController.findAll(req, res);
});

ticketRoutes.post('/', authenticate, async (req: Request, res: Response) => {
  await TicketController.create(req, res);
});

ticketRoutes.post(
  '/search',
  authenticate,
  async (req: Request, res: Response) => {
    await TicketController.search(req, res);
  },
);

export default ticketRoutes;
