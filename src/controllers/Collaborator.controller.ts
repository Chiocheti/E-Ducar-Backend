import { Response, Request } from "express";
import z from "zod";
import { ExpectedApiResponse } from "../Types/ApiTypes";
import Collaborator from "../models/Collaborator";
import { Op } from "sequelize";

const updateCollaboratorSchema = z.array(
  z.object({
    id: z.string().optional(),
    name: z.string(),
    code: z.number(),
  })
);

type UpdateCollaboratorType = z.infer<typeof updateCollaboratorSchema>;

const CollaboratorController = {
  async getAll(req: Request, res: Response) {
    try {
      const collaborators = await Collaborator.findAll({
        order: ["name"],
      });

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: JSON.stringify(collaborators),
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
    const { collaborators }: { collaborators: UpdateCollaboratorType } =
      req.body;

    try {
      const { success, error } =
        updateCollaboratorSchema.safeParse(collaborators);

      if (!success) {
        const apiResponse: ExpectedApiResponse = {
          success: false,
          type: 2,
          data: JSON.stringify(error),
        };

        return res.status(201).json(apiResponse);
      }

      const ids = collaborators
        .map((c) => c.id)
        .filter((id) => id !== undefined);

      await Collaborator.destroy({
        where: {
          id: { [Op.notIn]: ids },
        },
      });

      await Promise.all(
        collaborators.map(async (c) => {
          if (c.id) {
            await Collaborator.update(c, { where: { id: c.id } });
          } else {
            await Collaborator.create(c);
          }
        })
      );

      const apiResponse: ExpectedApiResponse = {
        success: true,
        type: 0,
        data: "Colaboradores editados com sucesso",
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

export default CollaboratorController;
