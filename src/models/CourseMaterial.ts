import { DataTypes, Model } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import db from "./";
import Course from "./Course";

class CourseMaterial extends Model {
  declare id: string;
  declare courseId: string;
  declare name: string;
  declare docType: string;
  declare link: string;
  declare order: number;
}

CourseMaterial.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    docType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: "course_materials",
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: (item) => {
        item.id = uuidv4();
      },
    },
  }
);

CourseMaterial.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

Course.hasMany(CourseMaterial, {
  foreignKey: "courseId",
  as: "courseMaterials",
});

export default CourseMaterial;
