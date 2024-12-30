import { Response, Request } from "express";
import z from "zod";
import Course from "../models/Course";
import { ExpectedApiResponse } from "../Types/Api.Controller.types";


const createCourseSchema = z.object({
  userId: z.string(),
  name: z.string(),
  description: z.string(),
  text: z.string(),
  required: z.string(),
  duration: z.string(),
  price: z.number(),
  isVisible: z.boolean(),
});

type CreateCourseType = z.infer<typeof createCourseSchema>;

const CourseController = {
  async getAll(req: Request, res: Response) {
    try {
      const courses = await Course.findAll({ order: ['name'] });

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
        const apiResponse: ExpectedApiResponse<string | null> = {
          success: false,
          data: null,
          error: 'Imagem é obrigatória',
        };
        return res.status(201).json(apiResponse);
      }

      const { success, error } = createCourseSchema.safeParse(course);

      if (!success) {
        const apiResponse: ExpectedApiResponse<string | null> = {
          success: false,
          data: null,
          error: JSON.stringify(error)
        }

        return res.status(201).json(apiResponse);
      }

      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

      const newCourse = { ...course, image: imageUrl };

      await Course.create(newCourse);

      const apiResponse: ExpectedApiResponse<string | null> = {
        success: true,
        data: 'Curso cadastrado com sucesso',
        error: null
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
  }
}

export default CourseController;
