import { Model, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import db from "./";
import Course from "./Course";

class Lesson extends Model {
  declare id: string;
  declare courseId: string;
  declare title: string;
  declare description: string;
  declare order: number;
  declare videoLink: string;
}

Lesson.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    videoLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "lessons",
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: (item) => {
        item.id = uuidv4();
      },
    },
  }
);

Lesson.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

Course.hasMany(Lesson, {
  foreignKey: "courseId",
  as: "lessons",
});

export default Lesson;
