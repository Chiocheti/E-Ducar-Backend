import { Response, Request } from "express";
import z from "zod";
import Student from "../models/Student";
import bcrypt from 'bcrypt'
import { ExpectedApiResponse } from "../Types/ApiTypes";

const createStudentSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  password: z.string(),
});

type CreateStudentType = z.infer<typeof createStudentSchema>;

const StudentController = {
  async getById(req: Request, res: Response) {
    const { id }: { id: string } = req.body;

    try {
      const student = await Student.findOne({ where: { id } });

      if (!student) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: 'Aluno não encontrado',
        };

        return res.status(201).json(apiResponse);
      }

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(student),
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

  async create(req: Request, res: Response) {
    const { student }: { student: CreateStudentType } = req.body;

    try {
      const { success, error } = createStudentSchema.safeParse(student);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      const findStudent = await Student.findOne({ where: { email: student.email } })

      if (findStudent) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: 'Este email ja está em uso',
        }

        return res.status(201).json(apiResponse);
      }

      const newStudent = {
        ...student,
        password: bcrypt.hashSync(student.password, 10),
        image: null,
      }

      await Student.create(newStudent);

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: 'Estudante cadastrado com sucesso',
      }

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

export default StudentController;