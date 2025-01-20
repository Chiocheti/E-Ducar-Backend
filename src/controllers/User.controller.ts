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
    try {
      const users = await User.findAll({ order: ['name'] });

      const apiResponse: ExpectedApiResponse<User[] | null> = {
        success: true,
        data: users,
        error: null
      };

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

  async getById(req: Request, res: Response) {
    const { id }: { id: string } = req.body;

    try {
      const user = await User.findOne({
        attributes: ['id', 'name', 'username', 'isTeacher', 'image'],
        where: { id }
      });

      if (!user) {
        const apiResponse: ExpectedApiResponse<string | null> = {
          success: false,
          data: null,
          error: JSON.stringify('Usuario não encontrado')
        };

        return res.status(201).json(apiResponse);
      }

      const apiResponse: ExpectedApiResponse<User | null> = {
        success: true,
        data: user,
        error: null
      };

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

  async getTeachers(req: Request, res: Response) {
    try {
      const teachers = await User.findAll({
        where: { isTeacher: true },
        attributes: ['name', 'id']
      });

      const apiResponse: ExpectedApiResponse<User[] | null> = {
        success: true,
        data: teachers,
        error: null
      };

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

  async create(req: Request, res: Response) {
    const { file } = req;
    const user: CreateUserType = JSON.parse(req.body.user);

    try {
      if (!file) {
        const apiResponse: ExpectedApiResponse<string | number> = {
          success: false,
          data: 2,
          error: JSON.stringify('Imagem é obrigatória'),
        };
        return res.status(201).json(apiResponse);
      }

      const { success, error } = createUserSchema.safeParse(user);

      if (!success) {
        const apiResponse: ExpectedApiResponse<string | number> = {
          success: false,
          data: 1,
          error: JSON.stringify(error)
        }

        return res.status(201).json(apiResponse);
      }

      const findUser = await User.findOne({ where: { username: user.username } })

      if (findUser) {
        const apiResponse: ExpectedApiResponse<string | number> = {
          success: false,
          data: 2,
          error: JSON.stringify('Este username ja está em uso')
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

      const apiResponse: ExpectedApiResponse<string | number> = {
        success: true,
        data: 'Usuario cadastrado com sucesso',
        error: null
      }

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<string | number> = {
        success: false,
        data: 0,
        error: JSON.stringify('Houve um erro interno')
      }

      return res.status(500).json(apiResponse);
    }
  },

  async update(req: Request, res: Response) {
    const { id, user }: { id: string, user: UpdateUserType } = req.body;

    try {
      const { success, error } = updateUserSchema.safeParse(user);

      if (!success) {
        const apiResponse: ExpectedApiResponse<string | number> = {
          success: false,
          data: 1,
          error: JSON.stringify(error)
        }

        return res.status(201).json(apiResponse);
      }

      if (user.password) {
        user.password = bcrypt.hashSync(user.password, 10)
      };

      await User.update(user, {
        where: { id },
      });

      const apiResponse: ExpectedApiResponse<string | number> = {
        success: true,
        data: 'Usuario editado com sucesso',
        error: null
      }

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<string | number> = {
        success: false,
        data: 0,
        error: JSON.stringify('Houve um erro interno')
      }

      return res.status(500).json(apiResponse);
    }
  },

  async updateImage(req: Request, res: Response) {
    const { file } = req;
    const imageLink: string = req.body.imageLink;
    const userId: string = req.body.userId;

    try {
      if (!file) {
        const apiResponse: ExpectedApiResponse<string | null> = {
          success: false,
          data: null,
          error: JSON.stringify('Imagem é obrigatória'),
        };
        return res.status(201).json(apiResponse);
      }

      const filePath = path.join(__dirname, '..', 'uploads', imageLink);

      if (!fs.existsSync(filePath)) {
        const apiResponse: ExpectedApiResponse<string | null> = {
          success: false,
          data: null,
          error: JSON.stringify('Arquivo não encontrado'),
        };
        return res.status(201).json(apiResponse);
      }

      fs.unlinkSync(filePath);

      const uniqueName = `${uuidv4()}-${file.originalname}`;
      const uploadPath = path.join(__dirname, '..', 'uploads', uniqueName);

      fs.writeFileSync(uploadPath, file.buffer);

      await User.update({ image: uniqueName }, { where: { id: userId } })

      const apiResponse: ExpectedApiResponse<string | null> = {
        success: true,
        data: 'Foto de perfil editada com sucesso',
        error: null
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
};

export default UserController;