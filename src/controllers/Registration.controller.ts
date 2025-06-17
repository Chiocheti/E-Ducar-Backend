const fs = require("fs");

import Registration from "../models/Registration";
import z from "zod";
import { ExpectedApiResponse } from "../Types/ApiTypes";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Response, Request } from "express";
import fontkit from "fontkit";

import Course from "../models/Course";
import Lesson from "../models/Lesson";
import Exam from "../models/Exams";
import Question from "../models/Question";
import QuestionOption from "../models/QuestionOption";
import LessonProgress from "../models/LessonProgress";
import Ticket from "../models/Ticket";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Includeable, IncludeOptions } from "sequelize";
import SplitString from "../utils/SplitString";
import GenerateRandomString from "../utils/GenerateRandomString";

const ubuntuBytes = fs.readFileSync("./src/fonts/UbuntuMono-Regular.ttf");
const ubuntuItalicBytes = fs.readFileSync("./src/fonts/Ubuntu-RI.ttf");
const ubuntuBoldBytes = fs.readFileSync("./src/fonts/Ubuntu-B.ttf");

const awsRegion = process.env.AWS_REGION || "";
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const awsSaveDegreeURL = process.env.S3_BUCKET_NAME_DEGREES || "";

const s3client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

const degreeUrl = process.env.S3_DEGREE_TEMPLATE || "";

const createRegistrationSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  registerDate: z.string(),
  supportDate: z.string(),
});

type CreateRegistrationType = z.infer<typeof createRegistrationSchema>;

const updateLessonProgressSchema = z.object({
  watchedAt: z.string().optional(),
});

type UpdateLessonProgressType = z.infer<typeof updateLessonProgressSchema>;

const updateRegistrationSchema = z.object({
  registerData: z.object({
    id: z.string(),
    examResult: z.number(),
    conclusionDate: z.string(),
  }),
  degreeData: z.object({
    studentName: z.string(),
    courseName: z.string(),
    duration: z.string(),
  }),
});

type UpdateRegistrationType = z.infer<typeof updateRegistrationSchema>;

const RegistrationController = {
  async getById(req: Request, res: Response) {
    const {
      registrationId,
      lessonProgress,
      exam,
    }: { registrationId: string; lessonProgress: boolean; exam: boolean } =
      req.body;

    let include: Includeable[] = [];

    if (lessonProgress) {
      const options: IncludeOptions = {
        model: LessonProgress,
        as: "lessonsProgress",
        include: [
          {
            model: Lesson,
            as: "lesson",
          },
        ],
        order: [["lesson", "order"]],
      };

      const options02: IncludeOptions = {
        model: Course,
        as: "course",
      };

      include.push(options, options02);
    }

    if (exam) {
      const options: IncludeOptions = {
        model: Course,
        as: "course",
        include: [
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
      };

      include.push(options);
    }

    try {
      const findRegistration = await Registration.findOne({
        include,
        where: { id: registrationId },
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

  async create(req: Request, res: Response) {
    const {
      registration,
      ticket,
    }: { registration: CreateRegistrationType; ticket: string | null } =
      req.body;

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
          data: JSON.stringify("Voce ja está matriculado nesse curso"),
        };

        return res.status(201).json(apiResponse);
      }

      let ticketId: string | null = null;

      if (ticket) {
        const findTicket = await Ticket.findOne({ where: { code: ticket } });

        if (!findTicket) {
          const apiResponse: ExpectedApiResponse = {
            success: false,
            type: 3,
            data: JSON.stringify("Esse cupom não existe"),
          };

          return res.status(201).json(apiResponse);
        }

        if (findTicket.used) {
          const apiResponse: ExpectedApiResponse = {
            success: false,
            type: 3,
            data: JSON.stringify("Esse cupom não  é mais valido"),
          };

          return res.status(201).json(apiResponse);
        }

        await findTicket.update({ used: true });

        ticketId = findTicket.id;
      }

      const { id: registrationId } = await Registration.create({
        ...registration,
        ticketId,
        conclusionDate: null,
        examResult: null,
        degreeLink: null,
      });

      const findLessons = await Lesson.findAll({
        where: { courseId: registration.courseId },
      });

      if (findLessons && registrationId) {
        findLessons.forEach(async (lesson) => {
          const lessonProgress = {
            lessonId: lesson.id,
            registrationId,
            watchedAt: null,
          };

          await LessonProgress.create(lessonProgress);
        });
      }

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify("Cadastro feito com sucesso"),
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
    const {
      id,
      lessonProgress,
    }: { id: string; lessonProgress: UpdateLessonProgressType } = req.body;

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
        where: { id },
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

  async finishCourse(req: Request, res: Response) {
    const { finishData }: { finishData: UpdateRegistrationType } = req.body;

    const pdfResponse = await fetch(degreeUrl);

    if (!pdfResponse.ok) {
      const apiResponse: ExpectedApiResponse = {
        success: false,
        type: 3,
        data: JSON.stringify("Erro ao baixar ou encontrar o template"),
      };

      return res.status(500).json(apiResponse);
    }

    try {
      const { success, error } = updateRegistrationSchema.safeParse(finishData);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      const {
        registerData,
        degreeData: { studentName, courseName, duration },
      } = finishData;

      const arrayBuffer = await pdfResponse.arrayBuffer();
      const existingPdfBytes = new Uint8Array(arrayBuffer);

      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      pdfDoc.registerFontkit(fontkit as any);

      const ubuntuFont = await pdfDoc.embedFont(ubuntuBytes);
      const ubuntuItalicFont = await pdfDoc.embedFont(ubuntuItalicBytes);
      const ubuntuBoltFont = await pdfDoc.embedFont(ubuntuBoldBytes);

      const page = pdfDoc.getPages()[0];

      const [line1, line2] = SplitString(studentName);

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

      const courseWidth = ubuntuItalicFont.widthOfTextAtSize(courseName, 26);
      page.drawText(courseName, {
        x: 610 - courseWidth,
        y: 295,
        size: 26,
        font: ubuntuItalicFont,
        color: rgb(0, 0, 0),
      });

      const durationText = `Compreendido em ${duration}`;
      const durationWidth = ubuntuItalicFont.widthOfTextAtSize(
        durationText,
        26
      );
      page.drawText(durationText, {
        x: 460 - durationWidth,
        y: 267,
        size: 26,
        font: ubuntuItalicFont,
        color: rgb(0, 0, 0),
      });

      const conclusionDateWidth = ubuntuItalicFont.widthOfTextAtSize(
        registerData.conclusionDate,
        26
      );
      page.drawText(registerData.conclusionDate, {
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
        ContentType: "application/pdf",
      };

      await s3client.send(new PutObjectCommand(params));

      const link = `https://${awsSaveDegreeURL}.s3.${awsRegion}.amazonaws.com/${randomCode}`;

      await Registration.update(
        {
          degreeLink: link,
          conclusionDate: registerData.conclusionDate,
          examResult: registerData.examResult,
        },
        { where: { id: registerData.id } }
      );

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

  async delete(req: Request, res: Response) {
    const { id } = req.query;

    try {
      if (!id || typeof id !== "string") {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify("Id não informado"),
        };

        return res.status(201).json(apiResponse);
      }

      await Registration.destroy({ where: { id } });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Matricula excluída com sucesso",
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
