import { DataTypes, Model } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import db from "./";
import Registration from "./Registration";
import Lesson from "./Lesson";

class LessonProgress extends Model {
  declare id: string;
  declare registrationId: string;
  declare lessonId: string;
  declare completed: boolean;
  declare watchedAt: string;
}

LessonProgress.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    registrationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "registrations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "lessons",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    watchedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: "lessons_progress",
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: (item) => {
        item.id = uuidv4();
      },
    },
  }
);

LessonProgress.belongsTo(Registration, {
  foreignKey: "registrationId",
  as: "registration",
});

LessonProgress.belongsTo(Lesson, {
  foreignKey: "lessonId",
  as: "lesson",
});

Registration.hasMany(LessonProgress, {
  foreignKey: "registrationId",
  as: "lessonsProgress",
});

Lesson.hasMany(LessonProgress, {
  foreignKey: "lessonId",
  as: "lessonsProgress",
});

export default LessonProgress;
