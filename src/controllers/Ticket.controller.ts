import { Response, Request } from "express";
import z from "zod";
import { ExpectedApiResponse } from "../Types/ApiTypes";
import Ticket from "../models/Ticket";
import Registration from "../models/Registration";
import Student from "../models/Student";
import Course from "../models/Course";
import { Op } from "sequelize";
import Collaborator from "../models/Collaborator";

const createTicketsSchema = z.array(
  z.object({
    code: z.string(),
    used: z.boolean(),
  })
);

type CreateTicketsType = z.infer<typeof createTicketsSchema>;

const TicketController = {
  async findAll(req: Request, res: Response) {
    try {
      const tickets = await Ticket.findAll();

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(tickets),
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

  async search(req: Request, res: Response) {
    try {
      const {
        studentName,
        collaboratorId,
        offset,
        pageRange,
      }: {
        studentName: string | null;
        collaboratorId: string | null;
        offset: number;
        pageRange: number;
      } = req.body;

      if (collaboratorId === null) {
        const students = await Student.findAll({
          include: [
            {
              model: Registration,
              as: "registrations",
              required: true,
              where: { ticketId: { [Op.is]: null } },
              include: [
                {
                  model: Ticket,
                  as: "ticket",
                },
                {
                  model: Course,
                  as: "course",
                },
              ],
            },
          ],
          where: studentName
            ? {
                [Op.or]: {
                  name: { [Op.like]: `%${studentName}%` },
                  email: { [Op.like]: `%${studentName}%` },
                  phone: { [Op.like]: `%${studentName}%` },
                },
              }
            : {},
          offset,
          limit: pageRange || 100000,
          order: ["name"],
        });

        const total = await Student.count({
          distinct: true,
          col: "id",
          include: [
            {
              model: Registration,
              as: "registrations",
              required: true,
              where: { ticketId: { [Op.is]: null } },
            },
          ],
          where: studentName
            ? {
                [Op.or]: {
                  name: { [Op.like]: `%${studentName}%` },
                  email: { [Op.like]: `%${studentName}%` },
                  phone: { [Op.like]: `%${studentName}%` },
                },
              }
            : {},
        });

        const apiResponse: ExpectedApiResponse = {
          success: true,
          type: 0,
          data: JSON.stringify({ students, total }),
        };

        return res.status(200).json(apiResponse);
      }

      if (collaboratorId === "off") {
        const students = await Student.findAll({
          include: [
            {
              model: Registration,
              as: "registrations",
              include: [
                {
                  model: Ticket,
                  as: "ticket",
                },
                {
                  model: Course,
                  as: "course",
                },
              ],
            },
          ],
          where: studentName
            ? {
                [Op.or]: {
                  name: { [Op.like]: `%${studentName}%` },
                  email: { [Op.like]: `%${studentName}%` },
                  phone: { [Op.like]: `%${studentName}%` },
                },
              }
            : {},
          offset,
          limit: pageRange || 100000,
          order: ["name"],
        });

        const total = await Student.count({
          distinct: true,
          col: "id",
          include: [
            {
              model: Registration,
              as: "registrations",
              required: true,
              include: [
                {
                  model: Ticket,
                  as: "ticket",
                },
              ],
            },
          ],
          where: studentName
            ? {
                [Op.or]: {
                  name: { [Op.like]: `%${studentName}%` },
                  email: { [Op.like]: `%${studentName}%` },
                  phone: { [Op.like]: `%${studentName}%` },
                },
              }
            : {},
        });

        const apiResponse: ExpectedApiResponse = {
          success: true,
          type: 0,
          data: JSON.stringify({ students, total }),
        };

        return res.status(200).json(apiResponse);
      }

      const students = await Student.findAll({
        include: [
          {
            model: Registration,
            as: "registrations",
            include: [
              {
                model: Ticket,
                as: "ticket",
                required: true,
                where: { collaboratorId },
              },
              {
                model: Course,
                as: "course",
              },
            ],
          },
        ],
        where: studentName
          ? {
              [Op.or]: {
                name: { [Op.like]: `%${studentName}%` },
                email: { [Op.like]: `%${studentName}%` },
                phone: { [Op.like]: `%${studentName}%` },
              },
            }
          : {},
        offset,
        limit: pageRange || 100000,
        order: ["name"],
      });

      const total = await Student.count({
        distinct: true,
        col: "id",
        include: [
          {
            model: Registration,
            as: "registrations",
            required: true,
            include: [
              {
                model: Ticket,
                as: "ticket",
                required: true,
                where: { collaboratorId },
              },
            ],
          },
        ],
        where: studentName
          ? {
              [Op.or]: {
                name: { [Op.like]: `%${studentName}%` },
                email: { [Op.like]: `%${studentName}%` },
                phone: { [Op.like]: `%${studentName}%` },
              },
            }
          : {},
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify({ students, total }),
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
