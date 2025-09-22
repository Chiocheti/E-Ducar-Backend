import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { Includeable, Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';

import Course from '../models/Course';
import Lesson from '../models/Lesson';
import LessonProgress from '../models/LessonProgress';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Ticket from '../models/Ticket';
import User from '../models/User';

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsStudentsUrl = process.env.S3_BUCKET_NAME_STUDENTS;

if (!awsRegion || !awsAccessKeyId || !awsSecretAccessKey || !awsStudentsUrl) {
  throw new Error('AWS credentials and bucket names must be set');
}

const s3client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

const createStudentSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  password: z.string(),
});

type CreateStudentType = z.infer<typeof createStudentSchema>;

const updateStudentSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  lastLogin: z.string().optional(),
});

type UpdateStudentType = z.infer<typeof updateStudentSchema>;

const StudentController = {
  async getById(req: Request, res: Response) {
    const { id, registrations }: { id: string; registrations: boolean } =
      req.body;

    const include: Includeable[] = [];

    if (registrations) {
      include.push({
        model: Registration,
        as: 'registrations',
        required: false,
        include: [
          {
            model: Course,
            as: 'course',
            include: [
              {
                model: User,
                as: 'user',
              },
            ],
          },
          {
            model: LessonProgress,
            as: 'lessonsProgress',
            include: [
              {
                model: Lesson,
                as: 'lesson',
              },
            ],
            order: [['lesson', 'order']],
          },
        ],
      });
    }

    try {
      const student = await Student.findOne({
        attributes: { exclude: ['password', 'refreshToken'] },
        include,
        where: { id },
      });

      if (!student) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: 'Aluno não encontrado',
        };

        return res.status(201).json(apiResponse);
      }

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(student),
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
    const { student }: { student: CreateStudentType } = req.body;

    try {
      const { success, error } = createStudentSchema.safeParse(student);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      const findStudent = await Student.findOne({
        where: { email: student.email },
      });

      if (findStudent) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: 'Este email ja está em uso',
        };

        return res.status(201).json(apiResponse);
      }

      const newStudent = {
        ...student,
        password: bcrypt.hashSync(student.password, 10),
        image: null,
      };

      await Student.create(newStudent);

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: 'Estudante cadastrado com sucesso',
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

  async trashCreate(req: Request, res: Response) {
    type CreateStudentType = {
      name: string;
      email: string;
      phone: string;
      password: string;
      repeatPassword: string;
      registrations: {
        courseId: string;
        ticketId: string | null;
        registerDate: string;
        conclusionDate: string;
        supportDate: string;
      }[];
    };

    const { student } = req.body;

    try {
      const findStudent = await Student.findOne({
        where: { email: student.email },
      });

      if (findStudent) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: 'Este email ja está em uso',
        };

        return res.status(201).json(apiResponse);
      }

      const newStudent = {
        ...student,
        password: bcrypt.hashSync(student.password, 10),
        image: null,
      };

      await Student.create(newStudent, {
        include: [
          {
            model: Registration,
            as: 'registrations',
          },
        ],
      });

      const ticketIds = student.registrations.map(
        (registration) => registration.ticketId,
      );

      await Ticket.update(
        { used: true },
        { where: { id: { [Op.in]: ticketIds } } },
      );

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: 'Estudante cadastrado com sucesso',
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
    const {
      id,
      student,
    }: {
      id: string;
      student: UpdateStudentType;
    } = req.body;

    try {
      const { success, error } = updateStudentSchema.safeParse(student);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      if (student.password) {
        student.password = bcrypt.hashSync(student.password, 10);
      }

      await Student.update(student, { where: { id } });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: 'Estudante editado com sucesso',
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
    const { imageLink, studentId }: { imageLink: string; studentId: string } =
      req.body;

    try {
      if (!fileContent) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: 'Imagem é obrigatória',
        };
        return res.status(201).json(apiResponse);
      }

      if (imageLink) {
        const deleteParams = {
          Bucket: awsStudentsUrl,
          Key: imageLink,
        };

        await s3client.send(new DeleteObjectCommand(deleteParams));
      }

      const uuid = uuidv4();

      const link = `https://${awsStudentsUrl}.s3.${awsRegion}.amazonaws.com/${uuid}`;

      const params = {
        Bucket: awsStudentsUrl,
        Key: uuid,
        Body: fileContent,
        ContentType: req.file?.mimetype || '',
      };

      await s3client.send(new PutObjectCommand(params));

      await Student.update({ image: link }, { where: { id: studentId } });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: 'Foto de perfil editada com sucesso',
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

export default StudentController;
