import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import db from '.';
import Course from './Course';

class Material extends Model {
  declare id: string;
  declare courseId: string;
  declare filename: string;
  declare mimetype: string;
  declare fileUrl: string;
  declare order: number;
}

Material.init(
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
        model: 'courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
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
    tableName: 'materials',
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: (item) => {
        item.id = uuidv4();
      },
    },
  },
);

Material.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
});

Course.hasMany(Material, {
  foreignKey: 'courseId',
  as: 'materials',
});

export default Material;
