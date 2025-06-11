import { Response, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import bcrypt from "bcrypt";

import { ExpectedApiResponse } from "../Types/ApiTypes";

import User from "../models/User";

import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const awsRegion = process.env.AWS_REGION || "";
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const awsUsersURL = process.env.S3_BUCKET_NAME_USERS || "";

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
      const users = await User.findAll({ order: ["name"] });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(users),
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      };

      return res.status(500).json(apiResponse);
    }
  },

  async getById(req: Request, res: Response) {
    const { id }: { id: string } = req.body;

    try {
      const user = await User.findOne({
        attributes: ["id", "name", "username", "isTeacher", "image"],
        where: { id },
      });

      if (!user) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: "Usuario não encontrado",
        };

        return res.status(201).json(apiResponse);
      }

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(user),
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      };

      return res.status(500).json(apiResponse);
    }
  },

  async getTeachers(req: Request, res: Response) {
    try {
      const teachers = await User.findAll({
        where: { isTeacher: true },
        attributes: ["name", "id", "image"],
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(teachers),
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      };

      return res.status(500).json(apiResponse);
    }
  },

  async create(req: Request, res: Response) {
    const fileContent = req.file?.buffer;
    const user: CreateUserType = JSON.parse(req.body.user);

    try {
      if (!fileContent) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: "Imagem é obrigatória",
        };

        return res.status(201).json(apiResponse);
      }

      const { success, error } = createUserSchema.safeParse(user);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      const findUser = await User.findOne({
        where: { username: user.username },
      });

      if (findUser) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: "Este username ja está em uso",
        };

        return res.status(201).json(apiResponse);
      }

      const uuid = uuidv4();

      const link = `https://${awsUsersURL}.s3.${awsRegion}.amazonaws.com/${uuid}`;

      const params = {
        Bucket: awsUsersURL,
        Key: uuid,
        Body: fileContent,
        ContentType: req.file?.mimetype || "",
      };

      await s3client.send(new PutObjectCommand(params));

      const newUser = {
        ...user,
        password: bcrypt.hashSync(user.password, 10),
        image: link,
      };

      await User.create(newUser);

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Usuario cadastrado com sucesso",
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      };

      return res.status(500).json(apiResponse);
    }
  },

  async update(req: Request, res: Response) {
    const { id, user }: { id: string; user: UpdateUserType } = req.body;

    try {
      const { success, error } = updateUserSchema.safeParse(user);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      if (user.password) {
        user.password = bcrypt.hashSync(user.password, 10);
      }

      await User.update(user, { where: { id } });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Usuario editado com sucesso",
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      };

      return res.status(500).json(apiResponse);
    }
  },

  async updateImage(req: Request, res: Response) {
    const fileContent = req.file?.buffer;
    const { imageLink, userId }: { imageLink: string; userId: string } =
      req.body;

    try {
      if (!fileContent) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 3,
          data: "Imagem é obrigatória",
        };
        return res.status(201).json(apiResponse);
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
        ContentType: req.file?.mimetype || "",
      };

      await s3client.send(new PutObjectCommand(params));

      await User.update({ image: link }, { where: { id: userId } });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Foto de perfil editada com sucesso",
      };

      return res.status(200).json(apiResponse);
    } catch (error) {
      console.log(error);

      const apiResponse: ExpectedApiResponse = {
        success: false,
        type: 1,
        data: JSON.stringify(error),
      };

      return res.status(500).json(apiResponse);
    }
  },
};

export default UserController;
