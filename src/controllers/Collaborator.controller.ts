import { Response, Request } from 'express';
import { Op } from 'sequelize';
import z from 'zod';

import sequelize from '../models';
import Collaborator from '../models/Collaborator';

const updateCollaboratorSchema = z.array(
  z.object({
    id: z.string().optional(),
    name: z.string(),
    code: z.number(),
  }),
);

type UpdateCollaboratorType = z.infer<typeof updateCollaboratorSchema>;

const CollaboratorController = {
  async getAll(req: Request, res: Response) {
    try {
      const collaborators = await Collaborator.findAll({
        order: ['name'],
      });

      return res.status(200).json(collaborators);
    } catch (error) {
      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async update(req: Request, res: Response) {
    console.log(' !! Start Transaction');
    const transaction = await sequelize.transaction();

    const {
      collaborators,
    }: {
      collaborators: UpdateCollaboratorType;
    } = req.body;

    try {
      const { success, error } =
        updateCollaboratorSchema.safeParse(collaborators);

      if (!success) {
        await transaction.rollback();
        console.log(' < Rollback Transaction');

        return res.status(422).json({
          message: 'Erro de Validação',
          error,
        });
      }

      const ids = collaborators
        .map((c) => c.id)
        .filter((id) => id !== undefined);

      await Collaborator.destroy({
        where: { id: { [Op.notIn]: ids } },
        transaction,
      });

      await Promise.all(
        collaborators.map(async (collaborator) => {
          if (collaborator.id) {
            await Collaborator.update(collaborator, {
              where: { id: collaborator.id },
              transaction,
            });
          } else {
            await Collaborator.create(collaborator, {
              transaction,
            });
          }
        }),
      );

      await transaction.commit();
      console.log(' > Commit Transaction');

      const updatedCollaborators = await Collaborator.findAll({
        order: ['name'],
      });

      return res.status(200).json(updatedCollaborators);
    } catch (error) {
      await transaction.rollback();
      console.log(' < Rollback Transaction');

      console.error(`Internal Server Error: ${error}`);
      console.log(error);

      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },
};

export default CollaboratorController;
