import { Model } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

import db from './';
import sequelize from "sequelize";
import Course from "./Course";

class Lesson extends Model {
  declare id: string;
  declare courseId: string;
  declare name: string;
  declare description: string;
  declare link: string;
}

Lesson.init({
  id: {
    type: sequelize.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: sequelize.UUIDV4,
  },
  courseId: {
    type: sequelize.UUID,
    allowNull: false,
    references: {
      model: 'courses',
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
  link: {
    type: sequelize.STRING,
    allowNull: false,
  },
}, {
  sequelize: db,
  tableName: 'lessons',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (item) => {
      item.id = uuidv4();
    }
  }
})

Lesson.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'courses',
})
export default Lesson;