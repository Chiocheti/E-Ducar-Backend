import { Response, Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Student from "../models/Student";

import { ExpectedApiResponse } from "../Types/ApiTypes";

const accessTokenDuration = "7d";
const refreshTokenDuration = "30d";

const AuthStudentController = {
  async login(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        time,
      }: { email: string; password: string; time: string } = req.body;

      const student = await Student.findOne({
        where: { email },
      });

      if (!student) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: JSON.stringify("Email ou senha incorretos"),
        };

        return res.status(201).json(apiResponse);
      }

      const isMatch = await bcrypt.compare(password, student.password);

      if (!isMatch) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: JSON.stringify("Email ou senha incorretos"),
        };

        return res.status(201).json(apiResponse);
      }

      const accessToken = jwt.sign(
        { id: student.id },
        `${process.env.ACCESS_TOKEN_SECRET_KEY}`,
        { expiresIn: accessTokenDuration }
      );
      const refreshToken = jwt.sign(
        { id: student.id },
        `${process.env.REFRESH_TOKEN_SECRET_KEY}`,
        { expiresIn: refreshTokenDuration }
      );

      await student.update({
        refreshToken,
        lastLogin: time,
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify({
          student: {
            id: student.id,
            email: student.email,
            image: student.image,
            lastLogin: student.lastLogin,
            name: student.name,
            phone: student.phone,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        }),
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

  async logout(req: Request, res: Response) {
    try {
      const { id }: { id: string } = req.body;

      const student = await Student.findOne({ where: { id } });

      if (!student) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: "Estudante não encontrado",
        };

        return res.status(201).json(apiResponse);
      }

      await student.update({ refreshToken: null });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Deslogado com sucesso",
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

export default AuthStudentController;
