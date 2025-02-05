import Course from "../models/Course";
import User from "../models/User";
import { Response, Request } from "express";
import z from "zod";
import { ExpectedApiResponse } from "../Types/ApiTypes";
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
            as: 'user',
          }
        ],
        order: ['name']
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(courses),
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

  async getOpen(req: Request, res: Response) {
    try {
      const courses = await Course.findAll({
        include: [
          {
            model: User,
            as: 'user',
          }
        ],
        where: { isVisible: true },
        order: ['name']
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(courses),
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

  async create(req: Request, res: Response) {
    const { file } = req;
    const course: CreateCourseType = JSON.parse(req.body.course);

    try {

      if (!file) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: 'Imagem é obrigatória',
        };
        return res.status(201).json(apiResponse);
      }

      const { success, error } = createCourseSchema.safeParse(course);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        }

        return res.status(201).json(apiResponse);
      }

      const uniqueName = `${uuidv4()}-${file.originalname}`;
      const uploadPath = path.join(__dirname, '..', 'uploads', uniqueName);

      fs.writeFileSync(uploadPath, file.buffer);

      const newCourse = { ...course, image: uniqueName };

      await Course.create({ ...newCourse, isVisible: false });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: 'Curso cadastrado com sucesso',
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

  async update(req: Request, res: Response) {
    const { id, course }: { id: string, course: UpdateCourseType } = req.body;

    try {
      const { success, error } = updateCourseSchema.safeParse(course);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        }

        return res.status(201).json(apiResponse);
      }

      await Course.update(course, { where: { id } });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: 'Curso editado com sucesso',
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

  async updateImage(req: Request, res: Response) {
    const { file } = req;
    const { imageLink, id }: { imageLink: string, id: string } = req.body;

    try {
      if (!file) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: 'Imagem é obrigatória',
        };
        return res.status(201).json(apiResponse);
      }

      const filePath = path.join(__dirname, '..', 'uploads', imageLink);

      if (!fs.existsSync(filePath)) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: 'Arquivo não encontrado',
        };
        return res.status(201).json(apiResponse);
      }

      fs.unlinkSync(filePath);

      const uniqueName = `${uuidv4()}-${file.originalname}`;
      const uploadPath = path.join(__dirname, '..', 'uploads', uniqueName);

      fs.writeFileSync(uploadPath, file.buffer);

      await Course.update({ image: uniqueName }, { where: { id } })

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: uniqueName,
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
}

export default CourseController;
