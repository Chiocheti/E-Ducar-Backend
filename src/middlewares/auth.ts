import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers['x-access-token'];
  if (!token || typeof token !== 'string') {
    res.status(401).json({ message: 'Nenhum token enviado' });
    return;
  }

  try {
    if (!process.env.ACCESS_TOKEN_SECRET_KEY) {
      res
        .status(401)
        .json({ message: 'ACCESS_TOKEN_SECRET_KEY não está definido' });
      return;
    }

    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);
      res.status(401).json({ message: 'Token inválido ou expirado' });
      return;
    }

    next();
  } catch (error) {
    console.error(`Internal Server Error: ${error}`);
    console.log(error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
}
