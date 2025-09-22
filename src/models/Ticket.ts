import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import db from '.';
import Collaborator from './Collaborator';

class Ticket extends Model {
  declare id: string;
  declare collaboratorId: string;
  declare code: string;
  declare used: boolean;
}

Ticket.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    collaboratorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'collaborators',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: 'tickets',
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: (item) => {
        item.id = uuidv4();
      },
    },
  },
);

Ticket.belongsTo(Collaborator, {
  foreignKey: 'collaboratorId',
  as: 'collaborator',
});

Collaborator.hasMany(Ticket, {
  foreignKey: 'collaboratorId',
  as: 'tickets',
});

export default Ticket;
