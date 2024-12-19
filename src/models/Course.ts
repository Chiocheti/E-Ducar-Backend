import { Model } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

import db from './';
import sequelize from "sequelize";
import User from "./User";

class Course extends Model {
  declare id: string;
  declare userId: string;
  declare name: string;
  declare description: string;
  declare text: string;
  declare required: string;
  declare duration: string;
  declare price: number;
};

Course.init({
  id: {
    type: sequelize.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: sequelize.UUIDV4,
  },
  userId: {
    type: sequelize.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  name: {
    type: sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: sequelize.STRING,
    allowNull: false,
  },
  text: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  required: {
    type: sequelize.STRING,
    allowNull: false,
  },
  duration: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  price: {
    type: sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  sequelize: db,
  tableName: 'courses',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (item) => {
      item.id = uuidv4();
    }
  }
})

Course.belongsTo(User, {
  foreignKey: 'userId',
  as: 'users',
})

export default Course;

