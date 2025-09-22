import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Response, Request } from 'express';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';

import sequelize from '../models';
import Course from '../models/Course';
import CourseMaterial from '../models/CourseMaterial';
import Exam from '../models/Exam';
import Lesson from '../models/Lesson';
import Question from '../models/Question';
import QuestionOption from '../models/QuestionOption';
import User from '../models/User';

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsCoursesURL = process.env.S3_BUCKET_NAME_COURSES;
const awsCourseMaterialsURL = process.env.S3_BUCKET_NAME_COURSE_MATERIALS;

if (
  !awsRegion ||
  !awsAccessKeyId ||
  !awsSecretAccessKey ||
  !awsCoursesURL ||
  !awsCourseMaterialsURL
) {
  throw new Error('AWS credentials and bucket names must be set');
}

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
  courseMaterials: z.array(
    z.object({
      name: z.string(),
      docType: z.string(),
      order: z.number(),
    }),
  ),
  lessons: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      order: z.number(),
      videoLink: z.string(),
    }),
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
          }),
        ),
      }),
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
      }),
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
            }),
          ),
        }),
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
            as: 'user',
          },
        ],
        order: [['name', 'ASC']],
      });

      return res.status(200).json(courses);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async getAllDetails(req: Request, res: Response) {
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
            as: 'exam',
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
                  },
                ],
              },
            ],
          },
        ],
        order: [['name', 'ASC']],
      });

      return res.status(200).json(courses);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
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
        ],
        where: { isVisible: true },
        order: ['name'],
      });

      return res.status(200).json(courses);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async getOpenDetails(req: Request, res: Response) {
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
            as: 'exam',
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
                  },
                ],
              },
            ],
          },
        ],
        where: { isVisible: true },
        order: ['name'],
      });

      return res.status(200).json(courses);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
          },
        ],
      });

      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }

      return res.status(200).json(course);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async getByIdDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id, {
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
            as: 'exam',
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
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }

      return res.status(200).json(course);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async getByName(req: Request, res: Response) {
    try {
      const { name } = req.params;

      const course = await Course.findOne({
        include: [
          {
            model: User,
            as: 'user',
          },
          {
            model: Lesson,
            as: 'lessons',
          },
        ],
        where: { name },
        order: [['lessons', 'order', 'ASC']],
      });

      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado' });
      }

      return res.status(200).json(course);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async create(req: Request, res: Response) {
    const files = req.files as {
      image: Express.Multer.File[];
      documents: Express.Multer.File[];
    };

    const image = files.image[0];
    const { documents } = files;

    const course: CreateCourseType = JSON.parse(req.body.course);

    if (!image) {
      return res.status(400).json({ message: 'Imagem obrigatória' });
    }

    console.log(' !! Start Transaction');
    const transaction = await sequelize.transaction();

    try {
      const { success, error } = createCourseSchema.safeParse(course);

      if (!success) {
        await transaction.rollback();
        console.log(' < Rollback Transaction');

        return res.status(400).json({
          message: 'Erro de Validação',
          error,
        });
      }

      const uuid = uuidv4();

      const link = `https://${awsCoursesURL}.s3.${awsRegion}.amazonaws.com/${uuid}`;

      const params = {
        Bucket: awsCoursesURL,
        Key: uuid,
        Body: image.buffer,
        ContentType: image.mimetype,
      };

      await s3client.send(new PutObjectCommand(params));

      const newCourseMaterials = await Promise.all(
        course.courseMaterials.map(async (material, index) => {
          const materialUUID = uuidv4();
          const materialLink = `https://${awsCourseMaterialsURL}.s3.${awsRegion}.amazonaws.com/${materialUUID}`;

          const document = documents[index];

          const materialParams = {
            Bucket: awsCourseMaterialsURL,
            Key: materialUUID,
            Body: document.buffer,
            ContentType: document.mimetype,
          };

          await s3client.send(new PutObjectCommand(materialParams));

          return { ...material, link: materialLink };
        }),
      );

      const newCourseData = {
        ...course,
        isVisible: false,
        image: link,
        courseMaterials: newCourseMaterials,
      };

      await Course.create(newCourseData, {
        include: [
          {
            model: CourseMaterial,
            as: 'courseMaterials',
          },
          {
            model: Lesson,
            as: 'lessons',
          },
          {
            model: Exam,
            as: 'exam',
            include: [
              {
                model: Question,
                as: 'questions',
                include: [
                  {
                    model: QuestionOption,
                    as: 'questionOptions',
                  },
                ],
              },
            ],
          },
        ],
        transaction,
      });

      await transaction.commit();
      console.log(' > Commit Transaction');

      return res.status(201).send({ message: 'Curso criado com sucesso' });
    } catch (error) {
      await transaction.rollback();
      console.log(' < Rollback Transaction');

      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async update(req: Request, res: Response) {
    const { course }: { course: UpdateCourseType } = req.body;

    console.log(' !! Start Transaction');
    const transaction = await sequelize.transaction();

    try {
      const { success, error } = updateCourseSchema.safeParse(course);

      if (!success) {
        await transaction.rollback();
        console.log(' < Rollback Transaction');

        return res.status(400).json({
          message: 'Erro de Validação',
          error,
        });
      }

      const { lessons, exam, ...courseRest } = course;

      await Course.update(courseRest, {
        where: { id: course.id },
        transaction,
      });

      if (lessons) {
        const lessonsIds = lessons
          .map((l) => l.id)
          .filter((id) => id !== undefined);

        await Lesson.destroy({
          where: {
            courseId: courseRest.id,
            id: { [Op.notIn]: lessonsIds },
          },
          transaction,
        });

        await Promise.all(
          lessons.map(async (lesson) => {
            if (lesson.id) {
              await Lesson.update(lesson, {
                where: { id: lesson.id },
                transaction,
              });
            } else {
              await Lesson.create(
                { ...lesson, courseId: course.id },
                {
                  transaction,
                },
              );
            }
          }),
        );
      }

      if (exam) {
        const { questions } = exam;

        await Exam.update(exam, {
          where: { id: exam.id },
          transaction,
        });

        const questionsIds = questions
          .map((q) => q.id)
          .filter((id) => id !== undefined);

        await Question.destroy({
          where: {
            examId: exam.id,
            id: { [Op.notIn]: questionsIds },
          },
          transaction,
        });

        await Promise.all(
          questions.map(async (question) => {
            if (!question.id) {
              await Question.create(
                { ...question, examId: exam.id },
                {
                  include: [
                    {
                      model: QuestionOption,
                      as: 'questionsOptions',
                    },
                  ],
                  transaction,
                },
              );
            } else {
              const { questionOptions, ...questionRest } = question;

              await Question.update(questionRest, {
                where: { id: questionRest.id },
                transaction,
              });

              const questionOptionsId = questionOptions
                .map((q) => q.id)
                .filter((id) => id !== undefined);

              await QuestionOption.destroy({
                where: {
                  id: {
                    [Op.notIn]: questionOptionsId,
                  },
                  questionId: questionRest.id,
                },
                transaction,
              });

              questionOptions.map(async (questionOption) => {
                if (!questionOption.id) {
                  await QuestionOption.create(
                    {
                      ...questionOption,
                      questionId: question.id,
                    },
                    {
                      transaction,
                    },
                  );
                } else {
                  await QuestionOption.update(questionOption, {
                    where: { id: questionOption.id },
                    transaction,
                  });
                }
              });
            }
          }),
        );
      }

      await transaction.commit();
      console.log(' > Commit Transaction');

      return res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      console.log(' < Rollback Transaction');

      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async updateImage(req: Request, res: Response) {
    const fileContent = req.file?.buffer;
    const { id } = req.body;
    const { imageLink } = req.body;

    if (!fileContent) {
      return res.status(400).json({ message: 'Imagem obrigatória' });
    }

    try {
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
        ContentType: req.file?.mimetype || '',
      };

      await s3client.send(new PutObjectCommand(params));

      await Course.update({ image: link }, { where: { id } });

      return res.status(204).send();
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },
};

export default CourseController;
