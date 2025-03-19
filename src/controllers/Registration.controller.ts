import Registration from "../models/Registration";
import z from "zod";
import { ExpectedApiResponse } from "../Types/ApiTypes";
import { Response, Request } from "express";
import Course from "../models/Course";
import Lesson from "../models/Lesson";
import Exam from "../models/Exams";
import Question from "../models/Question";
import QuestionOption from "../models/QuestionOption";
import LessonProgress from "../models/LessonProgress";
import StudentAnswer from "../models/StudentAnswer";

const createRegistrationSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  registerDate: z.string(),
  supportDate: z.string(),
});

type CreateRegistrationType = z.infer<typeof createRegistrationSchema>;

const updateLessonProgressSchema = z.object({
  id: z.string(),
  registrationId: z.string().optional(),
  lessonId: z.string().optional(),
  completed: z.boolean().optional(),
  watchedAt: z.string().optional(),
});

type UpdateLessonProgressType = z.infer<typeof updateLessonProgressSchema>;

const createStudentAnswerSchema = z.array(
  z.object({
    registrationId: z.string(),
    examId: z.string(),
    questionId: z.string(),
    questionOptionId: z.string(),
  })
);

type CreateStudentAnswerType = z.infer<typeof createStudentAnswerSchema>;

const RegistrationController = {
  async create(req: Request, res: Response) {
    const { registration }: { registration: CreateRegistrationType } = req.body;

    try {
      const { success, error } =
        createRegistrationSchema.safeParse(registration);

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
          courseId: registration.courseId,
        },
      });

      if (findRegistration) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: "Voce ja está matriculado nesse curso",
        };

        return res.status(201).json(apiResponse);
      }

      const { id: registrationId } = await Registration.create({
        ...registration,
        conclusionDate: null,
      });

      const findLessons = await Lesson.findAll({
        where: { courseId: registration.courseId },
      });

      if (findLessons && registrationId) {
        findLessons.forEach(async (lesson) => {
          const lessonProgress = {
            lessonId: lesson.id,
            registrationId,
            completed: false,
            watchedAt: null,
          };

          await LessonProgress.create(lessonProgress);
        });
      }

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Cadastro feito com sucesso",
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
    const { registrationId }: { registrationId: string } = req.body;

    try {
      const findRegistration = await Registration.findOne({
        include: [
          {
            model: LessonProgress,
            as: "lessonsProgress",
            separate: true,
            include: [
              {
                model: Lesson,
                as: "lesson",
              },
            ],
            order: [["lesson", "order"]],
          },
          {
            model: Course,
            as: "course",
            include: [
              {
                model: Exam,
                as: "exams",
                order: ["order"],
                separate: true,
                include: [
                  {
                    model: Question,
                    as: "questions",
                    order: ["order"],
                    separate: true,
                    include: [
                      {
                        model: QuestionOption,
                        as: "questionOptions",
                        separate: true,
                        order: ["order"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        where: {
          id: registrationId,
        },
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(findRegistration),
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

  async updateLessonProgress(req: Request, res: Response) {
    const { lessonProgress }: { lessonProgress: UpdateLessonProgressType } =
      req.body;

    try {
      const { success, error } =
        updateLessonProgressSchema.safeParse(lessonProgress);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      await LessonProgress.update(lessonProgress, {
        where: { id: lessonProgress.id },
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Aula editada com sucesso",
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

  async createStudentAnswer(req: Request, res: Response) {
    const { studentAnswers }: { studentAnswers: CreateStudentAnswerType } =
      req.body;

    try {
      const { success, error } =
        createStudentAnswerSchema.safeParse(studentAnswers);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      await StudentAnswer.bulkCreate(studentAnswers);

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Respostas salvas com sucesso",
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

export default RegistrationController;
