import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import db from '.';
import Course from './Course';
import Student from './Student';
import Ticket from './Ticket';

class Registration extends Model {
  declare id: string;
  declare studentId: string;
  declare courseId: string;
  declare ticketId: string | null;
  declare registerDate: string;
  declare conclusionDate: string | null;
  declare supportDate: string | null;
  declare examResult: number | null;
  declare degreeLink: string | null;
}

Registration.init(
  {
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
        model: 'students',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    ticketId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tickets',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    registerDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    conclusionDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    supportDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    examResult: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    degreeLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'registrations',
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: (item) => {
        item.id = uuidv4();
      },
    },
  },
);

Registration.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student',
});

Student.hasMany(Registration, {
  foreignKey: 'studentId',
  as: 'registrations',
});

Registration.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
});

Course.hasMany(Registration, {
  foreignKey: 'courseId',
  as: 'registrations',
});

Registration.belongsTo(Ticket, {
  foreignKey: 'ticketId',
  as: 'ticket',
});

Ticket.hasOne(Registration, {
  foreignKey: 'ticketId',
  as: 'registration',
});

export default Registration;
