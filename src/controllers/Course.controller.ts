import { Response, Request } from "express";
import z from "zod";
import { v4 as uuidv4 } from "uuid";

import { ExpectedApiResponse } from "../Types/ApiTypes";

import User from "../models/User";
import Exam from "../models/Exams";
import Lesson from "../models/Lesson";
import Course from "../models/Course";
import Question from "../models/Question";
import QuestionOption from "../models/QuestionOption";

import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const awsRegion = process.env.AWS_REGION || "";
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const awsCoursesURL = process.env.S3_BUCKET_NAME_COURSES || "";

const s3client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

const createCourseSchema = z.object({
  description: z.string(),
  duration: z.string(),
  name: z.string(),
  price: z.number(),
  required: z.string(),
  support: z.number(),
  text: z.string(),
  userId: z.string(),
  lessons: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      order: z.number(),
      videoLink: z.string(),
    })
  ),
  exam: z.object({
    title: z.string(),
    description: z.string(),
    questions: z.array(
      z.object({
        question: z.string(),
        order: z.number(),
        questionOptions: z.array(
          z.object({
            answer: z.string(),
            isAnswer: z.boolean(),
            order: z.number(),
          })
        ),
      })
    ),
  }),
});

type CreateCourseType = z.infer<typeof createCourseSchema>;

const updateCourseSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  duration: z.string().optional(),
  name: z.string().optional(),
  price: z.number().optional(),
  required: z.string().optional(),
  support: z.number().optional(),
  text: z.string().optional(),
  userId: z.string().optional(),
  isVisible: z.boolean().optional(),
  lessons: z
    .array(
      z.object({
        id: z.string().optional(),
        courseId: z.string().optional(),
        title: z.string(),
        description: z.string(),
        order: z.number(),
        videoLink: z.string(),
      })
    )
    .optional(),
  exam: z
    .object({
      id: z.string().optional(),
      courseId: z.string().optional(),
      title: z.string(),
      description: z.string(),
      questions: z.array(
        z.object({
          id: z.string().optional(),
          examId: z.string().optional(),
          question: z.string(),
          order: z.number(),
          questionOptions: z.array(
            z.object({
              id: z.string().optional(),
              questionId: z.string().optional(),
              answer: z.string(),
              isAnswer: z.boolean(),
              order: z.number(),
            })
          ),
        })
      ),
    })
    .optional(),
});

type UpdateCourseType = z.infer<typeof updateCourseSchema>;

const CourseController = {
  async getAll(req: Request, res: Response) {
    try {
      const courses = await Course.findAll({
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: Lesson,
            as: "lessons",
            separate: true,
            order: [["order", "ASC"]],
          },
          {
            model: Exam,
            as: "exam",
            include: [
              {
                model: Question,
                as: "questions",
                separate: true,
                order: [["order", "ASC"]],
                include: [
                  {
                    model: QuestionOption,
                    as: "questionOptions",
                    separate: true,
                    order: [["order", "ASC"]],
                  },
                ],
              },
            ],
          },
        ],
        order: [["name", "ASC"]],
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(courses),
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

  async getOpen(req: Request, res: Response) {
    try {
      const courses = await Course.findAll({
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: Lesson,
            as: "lessons",
            order: [["order", "ASC"]],
          },
          {
            model: Exam,
            as: "exam",
            include: [
              {
                model: Question,
                as: "questions",
                order: [["order", "ASC"]],
                include: [
                  {
                    model: QuestionOption,
                    as: "questionOptions",
                    order: [["order", "ASC"]],
                  },
                ],
              },
            ],
          },
        ],
        where: { isVisible: true },
        order: ["name"],
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(courses),
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

  async getById(req: Request, res: Response) {
    try {
      const { id }: { id: string } = req.body;

      const courses = await Course.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: Lesson,
            as: "lessons",
            order: [["order", "ASC"]],
          },
          {
            model: Exam,
            as: "exam",
            include: [
              {
                model: Question,
                as: "questions",
                order: [["order", "ASC"]],
                include: [
                  {
                    model: QuestionOption,
                    as: "questionOptions",
                    order: [["order", "ASC"]],
                  },
                ],
              },
            ],
          },
        ],
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(courses),
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

  async getByName(req: Request, res: Response) {
    try {
      const { courseName }: { courseName: string } = req.body;

      const course = await Course.findOne({
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: Lesson,
            as: "lessons",
            order: [["order", "ASC"]],
          },
        ],
        where: { name: courseName },
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(course),
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

  async create(req: Request, res: Response) {
    const fileContent = req.file?.buffer;
    const course: CreateCourseType = JSON.parse(req.body.course);

    try {
      if (!fileContent) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: "Imagem é obrigatória",
        };
        return res.status(201).json(apiResponse);
      }

      const { success, error } = createCourseSchema.safeParse(course);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      const uuid = uuidv4();

      const link = `https://${awsCoursesURL}.s3.${awsRegion}.amazonaws.com/${uuid}`;

      const params = {
        Bucket: awsCoursesURL,
        Key: uuid,
        Body: fileContent,
        ContentType: req.file?.mimetype || "",
      };

      await s3client.send(new PutObjectCommand(params));

      await Course.create(
        { ...course, isVisible: false, image: link },
        {
          include: [
            {
              model: Lesson,
              as: "lessons",
            },
            {
              model: Exam,
              as: "exam",
              include: [
                {
                  model: Question,
                  as: "questions",
                  include: [
                    {
                      model: QuestionOption,
                      as: "questionOptions",
                    },
                  ],
                },
              ],
            },
          ],
        }
      );

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Curso cadastrado com sucesso",
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

  async update(req: Request, res: Response) {
    const { course }: { course: UpdateCourseType } = req.body;

    try {
      const { success: courseSuccess, error: courseError } =
        updateCourseSchema.safeParse(course);

      if (!courseSuccess) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(courseError),
        };

        return res.status(201).json(apiResponse);
      }

      const { lessons, exam, ...courseRest } = course;

      await Course.update(courseRest, { where: { id: course.id } });

      if (lessons) {
        const findLessons = await Lesson.findAll({
          where: { courseId: course.id },
        });

        for (const lesson of findLessons) {
          if (!lessons.some((item) => lesson.id === item.id)) {
            await lesson.destroy();
          }
        }

        for (const lesson of lessons) {
          if (lesson.id) {
            await Lesson.update(lesson, { where: { id: lesson.id } });
          } else {
            await Lesson.create({ ...lesson, courseId: course.id });
          }
        }
      }

      if (exam) {
        const { questions } = exam;

        await Exam.update(exam, { where: { id: exam.id } });

        const findQuestions = await Question.findAll({
          where: { examId: exam.id },
        });

        for (const question of findQuestions) {
          if (!questions.some((item) => question.id === item.id)) {
            await question.destroy();
          }
        }

        for (const question of questions) {
          if (!question.id) {
            await Question.create(
              { ...question, examId: exam.id },
              {
                include: [
                  {
                    model: QuestionOption,
                    as: "questionOptions",
                  },
                ],
              }
            );
          } else {
            await Question.update(question, { where: { id: question.id } });

            const findQuestionOptions = await QuestionOption.findAll({
              where: { questionId: question.id },
            });

            for (const questionOption of findQuestionOptions) {
              if (
                !question.questionOptions.some(
                  (item) => questionOption.id === item.id
                )
              ) {
                await questionOption.destroy();
              }
            }

            for (const questionOption of question.questionOptions) {
              if (!questionOption.id) {
                await QuestionOption.create({
                  ...questionOption,
                  questionId: question.id,
                });
              } else {
                await QuestionOption.update(questionOption, {
                  where: { id: questionOption.id },
                });
              }
            }
          }
        }
      }

      console.log("Acabou");

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Curso editado com sucesso",
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

  async updateImage(req: Request, res: Response) {
    const fileContent = req.file?.buffer;
    const { imageLink, id }: { imageLink: string; id: string } = req.body;

    try {
      if (!fileContent) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: "Imagem é obrigatória",
        };
        return res.status(201).json(apiResponse);
      }

      const deleteParams = {
        Bucket: awsCoursesURL,
        Key: imageLink,
      };

      await s3client.send(new DeleteObjectCommand(deleteParams));

      const uuid = uuidv4();

      const link = `https://${awsCoursesURL}.s3.${awsRegion}.amazonaws.com/${uuid}`;

      const params = {
        Bucket: awsCoursesURL,
        Key: uuid,
        Body: fileContent,
        ContentType: req.file?.mimetype || "",
      };

      await s3client.send(new PutObjectCommand(params));

      await Course.update({ image: link }, { where: { id } });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Alteração feita com sucesso",
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

export default CourseController;
