import { Model, DataTypes } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

import db from './';

import Student from "./Student";
import Course from "./Course";

class Registration extends Model {
  declare id: string;
  declare studentId: string;
  declare courseId: string;
  declare registerDate: string;
  declare conclusionDate: string | null;
};

Registration.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "students",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
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
  registerDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  conclusionDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  sequelize: db,
  tableName: 'registrations',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeCreate: (item) => {
      item.id = uuidv4();
    }
  }
})

Registration.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student'
});

Student.hasMany(Registration, {
  foreignKey: 'studentId',
  as: 'registrations'
});

Registration.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

Course.hasMany(Registration, {
  foreignKey: 'courseId',
  as: 'registrations'
});

// Funciona

// Student.belongsToMany(Course, {
//   through: Registration,
//   foreignKey: "studentId",
//   as: "courses",
// });

// Course.belongsToMany(Student, {
//   through: Registration,
//   foreignKey: "courseId",
//   as: "students",
// });

export default Registration;