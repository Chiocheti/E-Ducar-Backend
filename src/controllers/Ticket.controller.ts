import { Response, Request } from 'express';
import { Op } from 'sequelize';
import z from 'zod';

import Course from '../models/Course';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Ticket from '../models/Ticket';

const createTicketsSchema = z.array(
  z.object({
    code: z.string(),
    collaboratorId: z.string(),
    used: z.boolean(),
  }),
);

type CreateTicketsType = z.infer<typeof createTicketsSchema>;

const TicketController = {
  async findAll(req: Request, res: Response) {
    try {
      const tickets = await Ticket.findAll();

      return res.status(200).json(tickets);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
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
              as: 'registrations',
              required: true,
              where: { ticketId: { [Op.is]: null } },
              include: [
                {
                  model: Ticket,
                  as: 'ticket',
                },
                {
                  model: Course,
                  as: 'course',
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
          order: ['name'],
        });

        const total = await Student.count({
          distinct: true,
          col: 'id',
          include: [
            {
              model: Registration,
              as: 'registrations',
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

        return res.status(200).json({ students, total });
      }

      if (collaboratorId === 'off') {
        const students = await Student.findAll({
          include: [
            {
              model: Registration,
              as: 'registrations',
              include: [
                {
                  model: Ticket,
                  as: 'ticket',
                },
                {
                  model: Course,
                  as: 'course',
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
          order: ['name'],
        });

        const total = await Student.count({
          distinct: true,
          col: 'id',
          include: [
            {
              model: Registration,
              as: 'registrations',
              required: true,
              include: [
                {
                  model: Ticket,
                  as: 'ticket',
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

        return res.status(200).json({ students, total });
      }

      const students = await Student.findAll({
        include: [
          {
            model: Registration,
            as: 'registrations',
            include: [
              {
                model: Ticket,
                as: 'ticket',
                required: true,
                where: { collaboratorId },
              },
              {
                model: Course,
                as: 'course',
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
        order: ['name'],
      });

      const total = await Student.count({
        distinct: true,
        col: 'id',
        include: [
          {
            model: Registration,
            as: 'registrations',
            required: true,
            include: [
              {
                model: Ticket,
                as: 'ticket',
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

      return res.status(200).json({ students, total });
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { tickets }: { tickets: CreateTicketsType } = req.body;

      const { success, error } = createTicketsSchema.safeParse(tickets);

      if (!success) {
        return res.status(422).json({
          message: 'Erro de validação nos dados enviados',
          error,
        });
      }

      await Ticket.bulkCreate(tickets);

      return res.status(204).send();
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },
};

export default TicketController;
