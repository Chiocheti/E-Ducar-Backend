import bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';

import Student from '../models/Student';

const accessTokenDuration = '7d';
const refreshTokenDuration = '30d';

const AuthStudentController = {
  async login(req: Request, res: Response) {
    const { email } = req.body;
    const { password } = req.body;
    const { time } = req.body;

    if (!email || !password || !time) {
      return res
        .status(401)
        .json({ message: 'Email ou Senha ou Hora Atual não enviados' });
    }

    try {
      const student = await Student.findOne({
        where: { email },
      });

      if (!student) {
        return res.status(401).json({ message: 'Usuário ou senha incorretos' });
      }

      const isMatch = await bcrypt.compare(password, student.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Usuário ou senha incorretos' });
      }

      const accessToken = jwt.sign(
        { id: student.id },
        `${process.env.ACCESS_TOKEN_SECRET_KEY}`,
        { expiresIn: accessTokenDuration },
      );
      const refreshToken = jwt.sign(
        { id: student.id },
        `${process.env.REFRESH_TOKEN_SECRET_KEY}`,
        { expiresIn: refreshTokenDuration },
      );

      await student.update({
        refreshToken,
        lastLogin: time,
      });

      return res.status(200).json({
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
      });
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async logout(req: Request, res: Response) {
    const { id } = req.body;

    if (!id) {
      return res.status(401).json({ message: 'Identificador não enviado' });
    }

    try {
      const student = await Student.findOne({ where: { id } });

      if (!student) {
        return res.status(400).json({ message: 'Estudante não encontrado' });
      }

      await student.update({ refreshToken: null });

      return res.status(204).send();
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },
};

export default AuthStudentController;
