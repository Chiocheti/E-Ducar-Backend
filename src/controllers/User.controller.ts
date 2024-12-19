import { Response, Request } from "express";
import z from "zod";
import User from "../models/User";
import bcrypt from 'bcrypt'
import { ExpectedApiResponse } from "../Types/Api.Controller.types";


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
      const users = await User.findAll();

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
    try {
      const { user }: { user: CreateUserType } = req.body;

      const { success, error } = createUserSchema.safeParse(user);

      if (!success) {
        const apiResponse: ExpectedApiResponse<string | null> = {
          success: false,
          data: null,
          error: JSON.stringify(error)
        }

        return res.status(201).json(apiResponse);
      }

      const findUser = await User.findOne({ where: { username: user.username } })

      if (findUser) {
        const apiResponse: ExpectedApiResponse<string | null> = {
          success: false,
          data: null,
          error: JSON.stringify('Este username ja está em uso')
        }

        return res.status(201).json(apiResponse);
      }

      await User.create({ ...user, password: bcrypt.hashSync(user.password, 10) });

      const apiResponse: ExpectedApiResponse<string | null> = {
        success: true,
        data: 'Usuario cadastrado com sucesso',
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

  async update(req: Request, res: Response) {
    const idSchema = z.string();

    const { id, user }: { id: string, user: UpdateUserType } = req.body;

    try {

      const { success: idSuccess, error: idError } = idSchema.safeParse(id);

      const { success: userSuccess, error: userError } = updateUserSchema.safeParse(user);

      if (!userSuccess) {
        return res.status(400).json({ message: 'User error', error: userError });
      }

      if (!idSuccess) {
        return res.status(400).json({ message: 'Id error', error: idError });
      }

      // const updatedUser = await User.update(user, {
      //   where: { id },
      // });

      return res.status(200).json(user);
    } catch (error) {
      console.log(error);

      return res.status(500).json({ message: 'Erro interno', error })
    }
  }
};

export default UserController;