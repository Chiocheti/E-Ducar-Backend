import { Model } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

import db from './';
import sequelize from "sequelize";
import Students from "./Student";
import Course from "./Course";

class Registration extends Model {
  declare id: string;
  declare studentId: string;
  declare courseId: string;
  declare data: string;
}

Registration.init({
  id: {
    type: sequelize.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: sequelize.UUIDV4,
  },
  studentId: {
    type: sequelize.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
  registerDate: {
    type: sequelize.DATEONLY,
    allowNull: false,
  },
  conclusionDate: {
    type: sequelize.DATEONLY,
    allowNull: false,
  },
}, {
  sequelize: db,
  tableName: 'registrations',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (item) => {
      item.id = uuidv4();
    }
  }
})

Students.belongsToMany(Course, {
  foreignKey: 'studentId',
  otherKey: 'courseId',
  as: 'courses',
  through: Registration
});

Course.belongsToMany(Students, {
  foreignKey: 'courseId',
  otherKey: 'studentId',
  as: 'students',
  through: Registration
});

export default Registration;