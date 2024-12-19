import { Response, Request } from "express";
// import z from "zod";
import Course from "../models/Course";
import { ExpectedApiResponse } from "../Types/Api.Controller.types";


// const createCourseSchema = z.object({
//   userId: z.string(),
//   name: z.string(),
//   description: z.string(),
//   text: z.string(),
//   required: z.string(),
//   duration: z.string(),
//   price: z.number(),
// });

// type CreateCourseType = z.infer<typeof createCourseSchema>;

const CourseController = {
  async getAll(req: Request, res: Response) {
    try {
      const courses = await Course.findAll();

      const apiResponse: ExpectedApiResponse<Course[] | null> = {
        success: false,
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
}

export default CourseController;
