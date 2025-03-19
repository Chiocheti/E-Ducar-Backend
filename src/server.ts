import "dotenv/config";
import app from "./app";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./Docs/swagger";

import routes from "./routes";

app.use(routes);

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
