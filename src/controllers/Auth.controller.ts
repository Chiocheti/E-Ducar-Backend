import User from "../models/User"
import { Response, Request } from "express"
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt';
import { UserPlusToken } from "../Types/Auth.Controller.types";
import { ExpectedApiResponse } from "../Types/Api.Controller.types";

const accessTokenDuration = '7d';
const refreshTokenDuration = '30d';

const AuthController = {
  async login(req: Request, res: Response) {
    type ResponseDataType = UserPlusToken | string;

    const { username, password }: { username: string, password: string } = req.body;
    try {
      const user = await User.findOne({ where: { username } });

      if (!user) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Usuário ou senha incorretos',
        }

        return res.status(201).json(apiResponse);
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Usuário ou senha incorretos',
        }

        return res.status(201).json(apiResponse);
      }

      const accessToken = jwt.sign({ id: user.id }, `${process.env.ACCESS_TOKEN_SECRET_KEY}`, { expiresIn: accessTokenDuration });
      const refreshToken = jwt.sign({ id: user.id }, `${process.env.REFRESH_TOKEN_SECRET_KEY}`, { expiresIn: refreshTokenDuration });

      await user.update({ refreshToken });

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: true,
        type: 0,
        data: {
          tokens: {
            accessToken,
            refreshToken,
          },
          user: {
            id: user.id,
            username,
            name: user.name,
            isTeacher: user.isTeacher,
            image: user.image
          },
        },
      }

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse)
    }
  },

  async logout(req: Request, res: Response) {
    type ResponseDataType = string;

    const { id }: { id: string } = req.body;
    try {

      const user = await User.findOne({ where: { id } });

      if (!user) {
        const apiResponse: ExpectedApiResponse<ResponseDataType> = {
          success: false,
          type: 3,
          data: 'Usuário não encontrado',
        }

        return res.status(201).json(apiResponse)
      }

      await user.update({ refreshToken: null });

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: true,
        type: 0,
        data: 'Deslogado com sucesso',
      }

      return res.status(200).json(apiResponse)
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse<ResponseDataType> = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      }

      return res.status(500).json(apiResponse)
    }
  }
}

export default AuthController;