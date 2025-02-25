import Course from "../models/Course";
import User from "../models/User";
import { Response, Request } from "express";
import z from "zod";
import { ExpectedApiResponse } from "../Types/ApiTypes";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from "path";
import Lesson from "../models/Lesson";
import Exam from "../models/Exams";
import Question from "../models/Question";
import QuestionOption from "../models/QuestionOption";

const createCourseSchema = z.object({
  description: z.string(),
  duration: z.string(),
  name: z.string(),
  price: z.number(),
  required: z.string(),
  support: z.number(),
  text: z.string(),
  userId: z.string(),
  lessons: z.array(z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    videoLink: z.string(),
  })),
  exams: z.array(z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    questions: z.array(z.object({
      question: z.string(),
      order: z.number(),
      questionOptions: z.array(z.object({
        answer: z.string(),
        isAnswer: z.boolean(),
        order: z.number(),
      })),
    }))
  })),
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
  lessons: z.array(z.object({
    id: z.string().optional(),
    courseId: z.string().optional(),
    title: z.string(),
    description: z.string(),
    order: z.number(),
    videoLink: z.string(),
  })).optional(),
  exams: z.array(z.object({
    id: z.string().optional(),
    courseId: z.string().optional(),
    title: z.string(),
    description: z.string(),
    order: z.number(),
    questions: z.array(z.object({
      id: z.string().optional(),
      examId: z.string().optional(),
      question: z.string(),
      order: z.number(),
      questionOptions: z.array(z.object({
        id: z.string().optional(),
        questionId: z.string().optional(),
        answer: z.string(),
        isAnswer: z.boolean(),
        order: z.number(),
      })),
    })),
  })).optional(),
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
          },
          {
            model: Lesson,
            as: 'lessons',
            separate: true,
            order: [['order', 'ASC']],
          },
          {
            model: Exam,
            as: 'exams',
            separate: true,
            order: [['order', 'ASC']],
            include: [
              {
                model: Question,
                as: 'questions',
                separate: true,
                order: [['order', 'ASC']],
                include: [
                  {
                    model: QuestionOption,
                    as: 'questionOptions',
                    separate: true,
                    order: [['order', 'ASC']],
                  }
                ]
              }
            ]
          }
        ],
        order: [['name', 'ASC']]
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
          },
          {
            model: Lesson,
            as: 'lessons',
            separate: true,
            order: [['order', 'ASC']],
          },
          {
            model: Exam,
            as: 'exams',
            separate: true,
            order: [['order', 'ASC']],
            include: [
              {
                model: Question,
                as: 'questions',
                separate: true,
                order: [['order', 'ASC']],
                include: [
                  {
                    model: QuestionOption,
                    as: 'questionOptions',
                    separate: true,
                    order: [['order', 'ASC']],
                  }
                ]
              }
            ]
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

  async getById(req: Request, res: Response) {
    try {

      const { id }: { id: string } = req.body;

      const courses = await Course.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
          },
          {
            model: Lesson,
            as: 'lessons',
            separate: true,
            order: [['order', 'ASC']],
          },
          {
            model: Exam,
            as: 'exams',
            separate: true,
            order: [['order', 'ASC']],
            include: [
              {
                model: Question,
                as: 'questions',
                separate: true,
                order: [['order', 'ASC']],
                include: [
                  {
                    model: QuestionOption,
                    as: 'questionOptions',
                    separate: true,
                    order: [['order', 'ASC']],
                  }
                ]
              }
            ]
          }
        ],
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

  async getByName(req: Request, res: Response) {
    try {

      const { courseName }: { courseName: string } = req.body;

      const courses = await Course.findOne({
        include: [
          {
            model: User,
            as: 'user',
          },
          {
            model: Lesson,
            as: 'lessons',
            separate: true,
            order: [['order', 'ASC']],
          },
          {
            model: Exam,
            as: 'exams',
            separate: true,
            order: [['order', 'ASC']],
            include: [
              {
                model: Question,
                as: 'questions',
                separate: true,
                order: [['order', 'ASC']],
                include: [
                  {
                    model: QuestionOption,
                    as: 'questionOptions',
                    separate: true,
                    order: [['order', 'ASC']],
                  }
                ]
              }
            ]
          }
        ],
        where: { name: courseName },
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

      await Course.create({ ...newCourse, isVisible: false }, {
        include: [
          {
            model: Lesson,
            as: 'lessons'
          },
          {
            model: Exam,
            as: 'exams',
            include: [
              {
                model: Question,
                as: 'questions',
                include: [
                  {
                    model: QuestionOption,
                    as: 'questionOptions'
                  }
                ]
              }
            ]
          }
        ]
      });

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
    const { course }: { course: UpdateCourseType } = req.body;

    try {
      const { success: courseSuccess, error: courseError } = updateCourseSchema.safeParse(course);

      if (!courseSuccess) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(courseError),
        };

        return res.status(201).json(apiResponse);
      };

      const { lessons, exams, ...courseRest } = course;

      await Course.update(courseRest, { where: { id: course.id } });

      if (lessons) {
        const findLessons = await Lesson.findAll({ where: { courseId: course.id } });

        findLessons.forEach(async (element) => {
          if (!lessons.find((item) => element.id === item.id)) {
            await element.destroy();
          }
        });

        lessons.forEach(async (element) => {
          if (element.id) {
            await Lesson.update(element, { where: { id: element.id } });
          } else {
            await Lesson.create({ ...element, courseId: course.id });
          }
        });
      }

      if (exams) {
        const findExams = await Exam.findAll({ where: { courseId: course.id } });

        findExams.forEach(async (element) => {
          if (!exams.find((item) => element.id === item.id)) {
            await element.destroy();
          }
        });

        exams.forEach(async (exam) => {
          if (!exam.id) {
            await Exam.create({ ...exam, courseId: course.id }, {
              include: [
                {
                  model: Question,
                  as: 'questions',
                  include: [
                    {
                      model: QuestionOption,
                      as: 'questionOptions'
                    }
                  ]
                }
              ]
            });
          } else {
            await Exam.update(exam, { where: { id: exam.id } });

            const findQuestions = await Question.findAll({ where: { examId: exam.id } });

            findQuestions.forEach(async (element) => {
              if (!exam.questions.find((item) => element.id === item.id)) await element.destroy();
            })

            exam.questions.forEach(async (question) => {
              if (!question.id) {
                await Question.create({ ...question, examId: exam.id }, {
                  include: [
                    {
                      model: QuestionOption,
                      as: 'questionOptions'
                    }
                  ]
                })
              } else {
                await Question.update(question, { where: { id: question.id } });

                const findQuestionOptions = await QuestionOption.findAll({ where: { questionId: question.id } });

                findQuestionOptions.forEach(async (element) => {
                  if (!question.questionOptions.find((item) => element.id === item.id)) await element.destroy();
                });

                question.questionOptions.forEach(async (questionOption) => {
                  if (!questionOption.id) {
                    await QuestionOption.create({ ...questionOption, questionId: question.id });
                  } else {
                    await QuestionOption.update(questionOption, { where: { id: questionOption.id } });
                  }
                })
              }
            })
          };
        });
      }

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
