import Registration from '../models/Registration'
import z from 'zod';
import { ExpectedApiResponse } from '../Types/ApiTypes';
import { Response, Request } from "express";

const createRegistrationSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  registerDate: z.string(),
})

type CreateRegistrationType = z.infer<typeof createRegistrationSchema>;

const RegistrationController = {
  async create(req: Request, res: Response) {
    const { registration }: { registration: CreateRegistrationType } = req.body;

    try {
      const { success, error } = createRegistrationSchema.safeParse(registration);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      const findRegistration = await Registration.findOne({
        where: {
          studentId: registration.studentId,
          courseId: registration.courseId
        }
      });

      if (findRegistration) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: 'Voce ja está matriculado nesse curso',
        };

        return res.status(201).json(apiResponse);
      }

      await Registration.create({ ...registration, conclusionDate: null });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: 'Cadastro feito com sucesso',
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse);
    }
  },
};

export default RegistrationController;