import { Response, Request } from "express";
import z from "zod";
import jwt from "jsonwebtoken"
import Student from "../models/Student";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt'
import { ExpectedApiResponse } from "../Types/Api.Controller.types";
import fs from 'fs';
import path from "path";
import { StudentPlusToken } from "../Types/Student.Controller.types";

const accessTokenDuration = '7d';
const refreshTokenDuration = '30d';

const createStudentSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  password: z.string(),
});

type CreateStudentType = z.infer<typeof createStudentSchema>;

const PublicStudentController = {
  async login(req: Request, res: Response) {
    type ResponseDataType = StudentPlusToken | string;

    try {
      const { email, password }: { email: string, password: string } = req.body;

      const student = await Student.findOne({ where: { email } });

      if (!student) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Email ou senha incorretos',
        }

        return res.status(201).json(apiResponse);
      }

      const isMatch = await bcrypt.compare(password, student.password);

      if (!isMatch) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Email ou senha incorretos',
        }

        return res.status(201).json(apiResponse);
      };

      const accessToken = jwt.sign({ id: student.id }, `${process.env.ACCESS_TOKEN_SECRET_KEY}`, { expiresIn: accessTokenDuration });
      const refreshToken = jwt.sign({ id: student.id }, `${process.env.REFRESH_TOKEN_SECRET_KEY}`, { expiresIn: refreshTokenDuration });

      await student.update({ refreshToken });

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: true,
        type: 0,
        data: {
          tokens: {
            accessToken,
            refreshToken,
          },
          student: {
            id: student.id,
            name: student.name,
            email: student.email,
            phone: student.phone,
            image: student.image
          },
        },
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse)
    }
  },

  async logout(req: Request, res: Response) {
    type ResponseDataType = string;

    try {
      const { id }: { id: string } = req.body;

      const student = await Student.findOne({ where: { id } });

      if (!student) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Estudante não encontrado',
        }

        return res.status(201).json(apiResponse)
      }

      await student.update({ refreshToken: null });

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: true,
        type: 0,
        data: 'Deslogado com sucesso',
      }

      return res.status(200).json(apiResponse)
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse)
    }
  },

  async create(req: Request, res: Response) {
    type ResponseDataType = string;

    const { file } = req;
    const { student }: { student: CreateStudentType } = JSON.parse(req.body);

    try {
      if (!file) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Imagem é obrigatória',
        };

        return res.status(201).json(apiResponse);
      }

      const { success, error } = createStudentSchema.safeParse(student);

      if (!success) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      const findStudent = await Student.findOne({ where: { email: student.email } })

      if (findStudent) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Este email ja está em uso',
        }

        return res.status(201).json(apiResponse);
      }

      const uniqueName = `${uuidv4()}-${file.originalname}`;
      const uploadPath = path.join(__dirname, '..', 'uploads', uniqueName);

      fs.writeFileSync(uploadPath, file.buffer);

      const newStudent = {
        ...student,
        password: bcrypt.hashSync(student.password, 10),
        image: uniqueName,
      }

      await Student.create(newStudent);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: true,
        type: 0,
        data: 'Estudante cadastrado com sucesso',
      }

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse);
    }
  },
};

export default PublicStudentController;