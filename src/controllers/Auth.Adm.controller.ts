import bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';

const accessTokenDuration = '7d';
const refreshTokenDuration = '30d';

const AuthAdmController = {
  async login(req: Request, res: Response) {
    const {
      username,
      password,
    }: {
      username: string;
      password: string;
    } = req.body;

    if (!username || !password) {
      return res
        .status(401)
        .json({ message: 'Username ou Senha não enviados' });
    }

    try {
      const user = await User.findOne({
        where: { username },
      });

      if (!user) {
        return res.status(401).json({ message: 'Usuário ou senha incorretos' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Usuário ou senha incorretos' });
      }

      const accessToken = jwt.sign(
        { id: user.id },
        `${process.env.ACCESS_TOKEN_SECRET_KEY}`,
        { expiresIn: accessTokenDuration },
      );
      const refreshToken = jwt.sign(
        { id: user.id },
        `${process.env.REFRESH_TOKEN_SECRET_KEY}`,
        { expiresIn: refreshTokenDuration },
      );

      await user.update({ refreshToken });

      return res.status(200).json({
        user: {
          id: user.id,
          image: user.image,
          isTeacher: user.isTeacher,
          username: user.username,
          name: user.name,
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
    const { id }: { id: string } = req.body;

    if (!id) {
      return res.status(401).json({ message: 'Identificador não enviado' });
    }

    try {
      const user = await User.findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      await user.update({ refreshToken: null });

      return res.status(204).send();
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },
};

export default AuthAdmController;
