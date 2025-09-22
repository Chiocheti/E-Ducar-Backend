import cors from 'cors';
// import express, { Request, Response } from 'express';
import express from 'express';
import morgan from 'morgan';
import cron from 'node-cron';
// import swaggerUI from "swagger-ui-express";

// import swaggerDocument from "./Docs/swagger";
import checkOrigin from './middlewares/checkOrigin';
import router from './routes';

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(checkOrigin);
app.use(router);

// app.get("/", (req: Request, res: Response) => {
//   res.redirect("/docs");
// });

// app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

cron.schedule('0 * * * *', () =>
  console.log(
    `Cron Modules Working every Hour: ${new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    })}`,
  ),
);

export default app;
