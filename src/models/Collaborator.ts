import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import db from '.';

class Collaborator extends Model {
  declare id: string;
  declare code: number;
  declare name: string;
}

Collaborator.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: 'collaborators',
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: (item) => {
        item.id = uuidv4();
      },
    },
  },
);

export default Collaborator;
