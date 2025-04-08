import { Model, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import db from "./";

class Ticket extends Model {
  declare id: string;
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
    tableName: "tickets",
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: (item) => {
        item.id = uuidv4();
      },
    },
  }
);

export default Ticket;
