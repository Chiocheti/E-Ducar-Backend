import cors from "cors";
import express, { Request, Response } from "express";
import morgan from "morgan";
import cron from "node-cron";
import swaggerUI from "swagger-ui-express";

import router from "./routes";
import swaggerDocument from "./Docs/swagger";
import checkOrigin from "./middlewares/checkOrigin";

const app = express();

app.use(morgan("tiny"));

app.use(cors());
app.use(express.json());

app.use(checkOrigin);

app.get("/", (req: Request, res: Response) => {
  res.redirect("/docs");
});

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use(router);

cron.schedule("0 * * * *", () =>
  console.log(
    `Cron Modules Working every Hour: ${new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    })}`
  )
);

export default app;
