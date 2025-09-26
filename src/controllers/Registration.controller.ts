import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Response, Request, NextFunction } from 'express';
import fontkit from 'fontkit';
import fs from 'fs';
import { PDFDocument, rgb } from 'pdf-lib';
import { Includeable, IncludeOptions } from 'sequelize';
import z from 'zod';

import sequelize from '../models';
import Course from '../models/Course';
import Exam from '../models/Exam';
import Lesson from '../models/Lesson';
import LessonProgress from '../models/LessonProgress';
import Question from '../models/Question';
import QuestionOption from '../models/QuestionOption';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Ticket from '../models/Ticket';
import GenerateRandomString from '../utils/GenerateRandomString';
import SplitString from '../utils/SplitString';

const ubuntuBytes = fs.readFileSync('./src/fonts/UbuntuMono-Regular.ttf');
const ubuntuItalicBytes = fs.readFileSync('./src/fonts/Ubuntu-RI.ttf');
const ubuntuBoldBytes = fs.readFileSync('./src/fonts/Ubuntu-B.ttf');

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsSaveDegreeURL = process.env.S3_BUCKET_NAME_DEGREES;
const degreeUrl = process.env.S3_DEGREE_TEMPLATE;

if (
  !awsRegion ||
  !awsAccessKeyId ||
  !awsSecretAccessKey ||
  !awsSaveDegreeURL ||
  !degreeUrl
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

const createRegistrationSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  registerDate: z.string(),
  supportDate: z.string(),
});

type CreateRegistrationType = z.infer<typeof createRegistrationSchema>;

const RegistrationController = {
  async getById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const registration = await Registration.findByPk(id);

      if (!registration) {
        return res.status(404).json({ message: 'Registro não encontrado' });
      }

      return res.status(200).json(registration);
    } catch (error) {
      next(error);
    }
  },

  async getByIdLessonProgress(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const registration = await Registration.findByPk(id, {
        include: [
          {
            model: LessonProgress,
            as: 'lessonsProgress',
            include: [
              {
                model: Lesson,
                as: 'lesson',
              },
            ],
          },
          {
            model: Course,
            as: 'course',
          },
        ],
        order: [['lessonsProgress', 'lesson', 'order']],
      });

      if (!registration) {
        return res.status(404).json({ message: 'Registro não encontrado' });
      }

      return res.status(200).json(registration);
    } catch (error) {
      next(error);
    }
  },

  async getByIdExam(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const registration = await Registration.findByPk(id, {
        include: [
          {
            model: Course,
            as: 'course',
            include: [
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
          },
        ],
      });

      if (!registration) {
        return res.status(404).json({ message: 'Registro não encontrado' });
      }

      return res.status(200).json(registration);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    const { registration } = req.body;
    const { ticket } = req.body;

    console.log(' !! Start Transaction');
    const transaction = await sequelize.transaction();

    try {
      const { success, error } =
        createRegistrationSchema.safeParse(registration);

      if (!success) {
        await transaction.rollback();
        console.log(' < Rollback Transaction');

        return res.status(422).json({
          message: 'Erro de Validação',
          error,
        });
      }

      const findRegistration = await Registration.findOne({
        where: {
          studentId: registration.studentId,
          courseId: registration.courseId,
        },
      });

      if (findRegistration) {
        await transaction.rollback();
        console.log(' < Rollback Transaction');

        return res.status(403).json({ message: 'Estudante já matriculado' });
      }

      let ticketId: string | null = null;

      if (ticket) {
        const findTicket = await Ticket.findOne({
          where: { code: ticket },
        });

        if (!findTicket || findTicket.used) {
          return res
            .status(404)
            .json({ message: 'Esse cupom não existe ou não é mais valido' });
        }

        await findTicket.update({ used: true }, { transaction });

        ticketId = findTicket.id;
      }

      const findLessons = await Lesson.findAll({
        where: { courseId: registration.courseId },
      });

      const lessonsProgress = findLessons.map((lp) => ({
        lessonId: lp.id,
        watchedAt: null,
      }));

      const createdRegistration = await Registration.create(
        {
          ...registration,
          ticketId,
          conclusionDate: null,
          examResult: null,
          degreeLink: null,
          lessonsProgress,
        },
        {
          include: [
            {
              model: LessonProgress,
              as: 'lessonsProgress',
            },
          ],
          transaction,
        },
      );

      await transaction.commit();
      console.log(' > Commit Transaction');

      return res.status(201).json(createdRegistration);
    } catch (error) {
      await transaction.rollback();
      console.log(' < Rollback Transaction');

      next(error);
    }
  },

  async updateLessonProgress(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body;

    console.log(' !! Start Transaction');
    const transaction = await sequelize.transaction();

    try {
      const findLessonProgress = await LessonProgress.findByPk(id);

      if (!findLessonProgress) {
        await transaction.rollback();
        console.log(' < Rollback Transaction');

        return res
          .status(404)
          .json({ message: 'Progresso da aula não encontrado' });
      }

      const now = new Date();
      const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');

      const newLessonProgress = await findLessonProgress.update(
        { watchedAt: mysqlDateTime },
        {
          transaction,
        },
      );

      await transaction.commit();
      console.log(' > Commit Transaction');

      return res.status(200).json(newLessonProgress);
    } catch (error) {
      await transaction.rollback();
      console.log(' < Rollback Transaction');

      next(error);
    }
  },

  async finishCourse(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Id é obrigatório' });
    }

    const pdfResponse = await fetch(degreeUrl);

    if (!pdfResponse.ok) {
      console.error('Erro ao baixar ou encontrar o template');

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }

    const findRegistration = await Registration.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
        },
        {
          model: Course,
          as: 'course',
        },
      ],
      raw: true,
    });

    if (!findRegistration) {
      return res.status(404).json({ message: 'Matrícula não encontrada' });
    }

    console.log(findRegistration);

    return res.status(200).json(findRegistration);

    try {
      const arrayBuffer = await pdfResponse.arrayBuffer();
      const existingPdfBytes = new Uint8Array(arrayBuffer);

      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      pdfDoc.registerFontkit(fontkit as any);

      const ubuntuFont = await pdfDoc.embedFont(ubuntuBytes);
      const ubuntuItalicFont = await pdfDoc.embedFont(ubuntuItalicBytes);
      const ubuntuBoltFont = await pdfDoc.embedFont(ubuntuBoldBytes);

      const page = pdfDoc.getPages()[0];

      const [line1, line2] = SplitString(degreeData.studentName);

      const nameLine1Height = ubuntuBoltFont.heightAtSize(40);
      const nameLine1Width = ubuntuBoltFont.widthOfTextAtSize(line1, 40);

      page.drawText(line1, {
        x: 620 - nameLine1Width,
        y: line2 ? 350 + nameLine1Height : 350,
        size: 40,
        font: ubuntuBoltFont,
        color: rgb(0, 0, 0),
      });

      if (line2) {
        const nameLine2Width = ubuntuBoltFont.widthOfTextAtSize(line2, 40);

        page.drawText(line2, {
          x: 620 - nameLine2Width,
          y: 350,
          size: 40,
          font: ubuntuBoltFont,
          color: rgb(0, 0, 0),
        });
      }

      const courseWidth = ubuntuItalicFont.widthOfTextAtSize(
        degreeData.courseName,
        26,
      );
      page.drawText(degreeData.courseName, {
        x: 610 - courseWidth,
        y: 295,
        size: 26,
        font: ubuntuItalicFont,
        color: rgb(0, 0, 0),
      });

      const durationText = `Compreendido em ${degreeData.duration}`;
      const durationWidth = ubuntuItalicFont.widthOfTextAtSize(
        durationText,
        26,
      );
      page.drawText(durationText, {
        x: 460 - durationWidth,
        y: 267,
        size: 26,
        font: ubuntuItalicFont,
        color: rgb(0, 0, 0),
      });

      const conclusionDateWidth = ubuntuItalicFont.widthOfTextAtSize(
        degreeData.conclusionDateToPrint,
        26,
      );
      page.drawText(degreeData.conclusionDateToPrint, {
        x: 610 - conclusionDateWidth,
        y: 238,
        size: 26,
        font: ubuntuItalicFont,
        color: rgb(0, 0, 0),
      });

      const randomCode = GenerateRandomString(10);
      const randomCodeText = `Código de Validação: ${randomCode}`;

      page.drawText(randomCodeText, {
        x: 10,
        y: 10,
        size: 10,
        opacity: 0.3,
        font: ubuntuFont,
        color: rgb(0, 0, 0),
      });

      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);

      const params = {
        Bucket: awsSaveDegreeURL,
        Key: randomCode,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      };

      await s3client.send(new PutObjectCommand(params));

      const link = `https://${awsSaveDegreeURL}.s3.${awsRegion}.amazonaws.com/${randomCode}`;

      await Registration.update(
        {
          degreeLink: link,
          conclusionDate: registerData.conclusionDate,
          examResult: registerData.examResult,
        },
        { where: { id: registerData.id } },
      );

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: 'Aula editada com sucesso',
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

  async delete(req: Request, res: Response) {
    const { id } = req.query;

    try {
      if (!id || typeof id !== 'string') {
        return res.status(404).json({ message: 'Id não informado' });
      }

      await Registration.destroy({ where: { id } });

      return res.status(201).send();
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },
};

export default RegistrationController;
