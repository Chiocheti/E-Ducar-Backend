import { Model, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import db from "./";
import User from "./User";

class Course extends Model {
  declare id: string;
  declare userId: string;
  declare name: string;
  declare isVisible: boolean;
  declare image: string;
  declare description: string;
  declare text: string;
  declare required: string;
  declare duration: string;
  declare support: string;
  declare price: number;
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    required: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    support: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: db,
    tableName: "courses",
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: (item) => {
        item.id = uuidv4();
      },
    },
  }
);

Course.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Course, {
  foreignKey: "userId",
  as: "courses",
});

export default Course;
