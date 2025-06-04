import { Response, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import User from "../models/User";
import Course from "../models/Course";
import Student from "../models/Student";
import Registration from "../models/Registration";
import { ExpectedApiResponse } from "../Types/ApiTypes";
import Ticket from "../models/Ticket";
import { Op } from "sequelize";
import LessonProgress from "../models/LessonProgress";
import Lesson from "../models/Lesson";

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

    try {
      const student = await Student.findOne({
        attributes: { exclude: ["password", "refreshToken"] },
        include: [
          {
            model: Registration,
            as: "registrations",
            required: registrations,
            include: [
              {
                model: Course,
                as: "course",
                include: [
                  {
                    model: User,
                    as: "user",
                  },
                ],
              },
              {
                model: LessonProgress,
                as: "lessonsProgress",
                include: [
                  {
                    model: Lesson,
                    as: "lesson",
                  },
                ],
                order: [["lesson", "order"]],
              },
            ],
          },
        ],
        where: { id },
      });

      if (!student) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: "Aluno não encontrado",
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
          data: "Este email ja está em uso",
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
        data: "Estudante cadastrado com sucesso",
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

    const student: CreateStudentType = req.body.student;

    try {
      const findStudent = await Student.findOne({
        where: { email: student.email },
      });

      if (findStudent) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: "Este email ja está em uso",
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
            as: "registrations",
          },
        ],
      });

      const ticketIds = student.registrations.map(
        (registration) => registration.ticketId
      );

      await Ticket.update(
        { used: true },
        { where: { id: { [Op.in]: ticketIds } } }
      );

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Estudante cadastrado com sucesso",
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
        data: "Estudante editado com sucesso",
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
    const { file } = req;
    const { imageLink, studentId }: { imageLink: string; studentId: string } =
      req.body;

    try {
      if (!file) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: "Imagem é obrigatória",
        };
        return res.status(201).json(apiResponse);
      }

      if (imageLink) {
        const filePath = path.join(__dirname, "..", "uploads", imageLink);

        if (!fs.existsSync(filePath)) {
          const apiResponse: ExpectedApiResponse = {
            success: false,
            type: 3,
            data: "Arquivo não encontrado",
          };

          return res.status(201).json(apiResponse);
        }

        fs.unlinkSync(filePath);
      }

      const uniqueName = `${uuidv4()}-${file.originalname}`;
      const uploadPath = path.join(__dirname, "..", "uploads", uniqueName);

      fs.writeFileSync(uploadPath, file.buffer);

      await Student.update({ image: uniqueName }, { where: { id: studentId } });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Foto de perfil editada com sucesso",
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
