import Course from "../models/Course";
import User from "../models/User";
import { Response, Request } from "express";
import z from "zod";
import { ExpectedApiResponse } from "../Types/Api.Controller.types";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from "path";

const createCourseSchema = z.object({
  description: z.string(),
  duration: z.string(),
  name: z.string(),
  price: z.number(),
  required: z.string(),
  support: z.number(),
  text: z.string(),
  userId: z.string(),
});

type CreateCourseType = z.infer<typeof createCourseSchema>;

const updateCourseSchema = z.object({
  description: z.string().optional(),
  duration: z.string().optional(),
  name: z.string().optional(),
  price: z.number().optional(),
  required: z.string().optional(),
  support: z.number().optional(),
  text: z.string().optional(),
  userId: z.string().optional(),
});

type UpdateCourseType = z.infer<typeof updateCourseSchema>;

const CourseController = {
  async getAll(req: Request, res: Response) {
    try {
      const courses = await Course.findAll({
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['name'],
          }
        ],
        order: ['name']
      });

      const apiResponse: ExpectedApiResponse<Course[] | null> = {
        success: true,
        data: courses,
        error: null,
      }

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<string | null> = {
        success: false,
        data: null,
        error: JSON.stringify('Houve um erro interno')
      }

      return res.status(500).json(apiResponse);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { file } = req;
      const course: CreateCourseType = JSON.parse(req.body.course);

      if (!file) {
        const apiResponse: ExpectedApiResponse<string | number | null> = {
          success: false,
          data: 2,
          error: JSON.stringify('Imagem é obrigatória'),
        };
        return res.status(201).json(apiResponse);
      }

      const { success, error } = createCourseSchema.safeParse(course);

      if (!success) {
        const apiResponse: ExpectedApiResponse<string | number | null> = {
          success: false,
          data: 1,
          error: JSON.stringify(error)
        }

        return res.status(201).json(apiResponse);
      }

      const uniqueName = `${uuidv4()}-${file.originalname}`;
      const uploadPath = path.join(__dirname, '..', 'uploads', uniqueName);

      fs.writeFileSync(uploadPath, file.buffer);

      const newCourse = { ...course, image: uniqueName };

      await Course.create({ ...newCourse, isVisible: false });

      const apiResponse: ExpectedApiResponse<string | number | null> = {
        success: true,
        data: 'Curso cadastrado com sucesso',
        error: null
      }

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<string | number | null> = {
        success: false,
        data: 0,
        error: JSON.stringify('Houve um erro interno')
      }

      return res.status(500).json(apiResponse);
    }
  },

  async update(req: Request, res: Response) {
    const { id, course }: { id: string, course: UpdateCourseType } = req.body;

    try {
      const { success, error } = updateCourseSchema.safeParse(course);

      if (!success) {
        const apiResponse: ExpectedApiResponse<string | number> = {
          success: false,
          data: 1,
          error: JSON.stringify(error)
        }

        return res.status(201).json(apiResponse);
      }

      await Course.update(course, { where: { id } });

      const apiResponse: ExpectedApiResponse<string | number> = {
        success: true,
        data: 'Usuario editado com sucesso',
        error: null
      }

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<string | number> = {
        success: false,
        data: 0,
        error: JSON.stringify('Houve um erro interno')
      }

      return res.status(500).json(apiResponse);
    }
  },

  async updateImage(req: Request, res: Response) {
    const { file } = req;
    const imageLink: string = req.body.imageLink;
    const id: string = req.body.id;

    try {
      if (!file) {
        const apiResponse: ExpectedApiResponse<string | number> = {
          success: false,
          data: 2,
          error: JSON.stringify('Imagem é obrigatória'),
        };
        return res.status(201).json(apiResponse);
      }

      const filePath = path.join(__dirname, '..', 'uploads', imageLink);

      if (!fs.existsSync(filePath)) {
        const apiResponse: ExpectedApiResponse<string | number> = {
          success: false,
          data: 2,
          error: JSON.stringify('Arquivo não encontrado'),
        };
        return res.status(201).json(apiResponse);
      }

      fs.unlinkSync(filePath);

      const uniqueName = `${uuidv4()}-${file.originalname}`;
      const uploadPath = path.join(__dirname, '..', 'uploads', uniqueName);

      fs.writeFileSync(uploadPath, file.buffer);

      await Course.update({ image: uniqueName }, { where: { id } })

      const apiResponse: ExpectedApiResponse<string | number> = {
        success: true,
        data: 'Foto do curso editada com sucesso',
        error: null
      }

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<string | number> = {
        success: false,
        data: 0,
        error: JSON.stringify('Houve um erro interno')
      }

      return res.status(500).json(apiResponse);
    }
  },
}

export default CourseController;
