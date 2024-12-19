import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export default function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];

  if (!token || typeof token !== 'string') {
    res.status(201).json({ status: 2, message: 'Nenhum token enviado' });

    return
  }

  try {
    if (!process.env.ACCESS_TOKEN_SECRET_KEY) {
      res.status(201).json({
        status: 2,
        message: 'ACCESS_TOKEN_SECRET_KEY não está definido',
      });

      return
    }

    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    } catch (error) {
      res.status(201).json({
        status: 2,
        message: 'Token inválido ou expirado',
      });

      return
    }

    next();
  } catch (error) {
    res.status(500).json({
      status: 3,
      message: JSON.stringify(error),
    });

    return
  }
}
