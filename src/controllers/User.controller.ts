import { Response, Request } from "express";
import z from "zod";
import User from "../models/User";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt'
import { ExpectedApiResponse } from "../Types/Api.Controller.types";
import fs from 'fs';
import path from "path";

const createUserSchema = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
  isTeacher: z.boolean(),
});

type CreateUserType = z.infer<typeof createUserSchema>;

const updateUserSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  isTeacher: z.boolean().optional(),
});

type UpdateUserType = z.infer<typeof updateUserSchema>;

const UserController = {
  async getAll(req: Request, res: Response) {
    type ResponseDataType = User[] | string;

    try {
      const users = await User.findAll({ order: ['name'] });

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: true,
        type: 0,
        data: users,
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse);
    }
  },

  async getById(req: Request, res: Response) {
    type ResponseDataType = User | string;

    const { id }: { id: string } = req.body;

    try {
      const user = await User.findOne({
        attributes: ['id', 'name', 'username', 'isTeacher', 'image'],
        where: { id }
      });

      if (!user) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Usuario não encontrado',
        };

        return res.status(201).json(apiResponse);
      }

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: true,
        type: 0,
        data: user,
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse);
    }
  },

  async getTeachers(req: Request, res: Response) {
    type ResponseDataType = User[] | string;

    try {
      const teachers = await User.findAll({
        where: { isTeacher: true },
        attributes: ['name', 'id']
      });

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: true,
        type: 0,
        data: teachers,
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse);
    }
  },

  async create(req: Request, res: Response) {
    type ResponseDataType = string;

    const { file } = req;
    const user: CreateUserType = JSON.parse(req.body.user);

    try {
      if (!file) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Imagem é obrigatória',
        };

        return res.status(201).json(apiResponse);
      }

      const { success, error } = createUserSchema.safeParse(user);

      if (!success) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      const findUser = await User.findOne({ where: { username: user.username } })

      if (findUser) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Este username ja está em uso',
        }

        return res.status(201).json(apiResponse);
      }

      const uniqueName = `${uuidv4()}-${file.originalname}`;
      const uploadPath = path.join(__dirname, '..', 'uploads', uniqueName);

      fs.writeFileSync(uploadPath, file.buffer);

      const newUser = {
        ...user,
        password: bcrypt.hashSync(user.password, 10),
        image: uniqueName,
      }

      await User.create(newUser);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: true,
        type: 0,
        data: 'Usuario cadastrado com sucesso',
      }

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse);
    }
  },

  async update(req: Request, res: Response) {
    type ResponseDataType = string;

    const { id, user }: { id: string, user: UpdateUserType } = req.body;

    try {
      const { success, error } = updateUserSchema.safeParse(user);

      if (!success) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        }

        return res.status(201).json(apiResponse);
      }

      if (user.password) {
        user.password = bcrypt.hashSync(user.password, 10)
      };

      await User.update(user, { where: { id } });

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: true,
        type: 0,
        data: 'Usuario editado com sucesso',
      }

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse);
    }
  },

  async updateImage(req: Request, res: Response) {
    type ResponseDataType = string;

    const { file } = req;
    const { imageLink, userId }: { imageLink: string, userId: string } = req.body;

    try {
      if (!file) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Imagem é obrigatória',
        };
        return res.status(201).json(apiResponse);
      }

      const filePath = path.join(__dirname, '..', 'uploads', imageLink);

      if (!fs.existsSync(filePath)) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
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

      await User.update({ image: uniqueName }, { where: { id: userId } })

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: true,
        type: 0,
        data: 'Foto de perfil editada com sucesso',
      }

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse);
    }
  },
};

export default UserController;