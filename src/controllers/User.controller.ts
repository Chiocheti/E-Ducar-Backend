import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';

import User from '../models/User';

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsUsersURL = process.env.S3_BUCKET_NAME_USERS;

if (!awsRegion || !awsAccessKeyId || !awsSecretAccessKey) {
  throw new Error('AWS credentials and bucket names must be set');
}

const s3client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

const createUserSchema = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
  isTeacher: z.boolean(),
});

type CreateUserType = z.infer<typeof createUserSchema>;

const updateUserSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  isTeacher: z.boolean().optional(),
});

type UpdateUserType = z.infer<typeof updateUserSchema>;

const UserController = {
  async getAll(req: Request, res: Response) {
    try {
      const users = await User.findAll({ order: ['name'] });

      return res.status(200).json(users);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({ message: 'Id não informado' });
    }

    try {
      const user = await User.findOne({
        attributes: ['id', 'name', 'username', 'isTeacher', 'image'],
        where: { id },
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario não encontrado' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async getTeachers(req: Request, res: Response) {
    try {
      const teachers = await User.findAll({
        where: { isTeacher: true },
      });

      return res.status(200).json(teachers);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async create(req: Request, res: Response) {
    const fileContent = req.file?.buffer;
    const user: CreateUserType = JSON.parse(req.body.user);

    try {
      if (!fileContent) {
        return res.status(404).json({ message: 'Imagem é obrigatória' });
      }

      const { success, error } = createUserSchema.safeParse(user);

      if (!success) {
        return res.status(422).json({
          message: 'Erro de validação nos dados enviados',
          error,
        });
      }

      const findUser = await User.findOne({
        where: { username: user.username },
      });

      if (findUser) {
        return res
          .status(409)
          .json({ message: 'Este username ja está em uso' });
      }

      const uuid = uuidv4();

      const link = `https://${awsUsersURL}.s3.${awsRegion}.amazonaws.com/${uuid}`;

      const params = {
        Bucket: awsUsersURL,
        Key: uuid,
        Body: fileContent,
        ContentType: req.file?.mimetype || '',
      };

      await s3client.send(new PutObjectCommand(params));

      const newUser = {
        ...user,
        password: bcrypt.hashSync(user.password, 10),
        image: link,
      };

      await User.create(newUser);

      return res.status(204).send();
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async update(req: Request, res: Response) {
    const {
      id,
      user,
    }: {
      id: string;
      user: UpdateUserType;
    } = req.body;

    try {
      const { success, error } = updateUserSchema.safeParse(user);

      if (!success) {
        return res.status(422).json({
          message: 'Erro de validação nos dados enviados',
          error,
        });
      }

      if (user.password) {
        user.password = bcrypt.hashSync(user.password, 10);
      }

      await User.update(user, { where: { id } });

      return res.status(204).send();
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async updateImage(req: Request, res: Response) {
    const fileContent = req.file?.buffer;
    const {
      imageLink,
      userId,
    }: {
      imageLink: string;
      userId: string;
    } = req.body;

    try {
      if (!fileContent) {
        return res.status(404).json({ message: 'Imagem é obrigatória' });
      }

      const deleteParams = {
        Bucket: awsUsersURL,
        Key: imageLink,
      };

      await s3client.send(new DeleteObjectCommand(deleteParams));

      const uuid = uuidv4();

      const link = `https://${awsUsersURL}.s3.${awsRegion}.amazonaws.com/${uuid}`;

      const params = {
        Bucket: awsUsersURL,
        Key: uuid,
        Body: fileContent,
        ContentType: req.file?.mimetype || '',
      };

      await s3client.send(new PutObjectCommand(params));

      await User.update({ image: link }, { where: { id: userId } });

      return res.status(204).send();
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },
};

export default UserController;
