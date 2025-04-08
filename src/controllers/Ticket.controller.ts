import { Response, Request } from "express";
import z from "zod";
import { ExpectedApiResponse } from "../Types/ApiTypes";
import Ticket from "../models/Ticket";

const createTicketsSchema = z.array(
  z.object({
    code: z.string(),
    used: z.boolean(),
  })
);

type CreateTicketsType = z.infer<typeof createTicketsSchema>;

const TicketController = {
  async createTickets(req: Request, res: Response) {
    try {
      const { tickets }: { tickets: CreateTicketsType } = req.body;

      const { success, error } = createTicketsSchema.safeParse(tickets);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      await Ticket.bulkCreate(tickets);

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify("Tickets criados com sucesso!"),
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      };

      return res.status(500).json(apiResponse);
    }
  },
};

export default TicketController;
