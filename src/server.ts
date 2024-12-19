import 'dotenv/config';
import app from './app';
import swaggerUI from 'swagger-ui-express'
import swaggerDocs from './swagger.json'

import routes from './routes';

app.use(routes);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
})
