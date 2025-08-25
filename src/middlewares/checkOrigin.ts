import { Request, Response, NextFunction, RequestHandler } from "express";

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

const checkOrigin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.get("origin") || req.get("referer");
  console.log(`Allowed Origins: `);
  allowedOrigins.forEach((o) => console.log(`-> ${o}`));
  console.log(`Request Origin: ${origin}`);

  if (origin && allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
    next();
    return;
  }

  console.log(`Origin denied: 🚫 ${origin} 🚫`);
  res.status(403).json({ error: `Access denied: ${origin} 🚫` });
  return;
};

export default checkOrigin;
