import cors from 'cors';
import express, { Request, Response } from 'express';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.redirect('/docs');
});
export default app;