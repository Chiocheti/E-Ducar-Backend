import cors from 'cors';
import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req: Request, res: Response) => {
  res.redirect('/docs');
});

export default app;