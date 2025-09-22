import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import db from '.';
import Exam from './Exam';

class Question extends Model {
  declare id: string;
  declare examId: string;
  declare question: string;
  declare order: number;
}

Question.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    examId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'exams',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: 'questions',
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: (item) => {
        item.id = uuidv4();
      },
    },
  },
);

Question.belongsTo(Exam, {
  foreignKey: 'examId',
  as: 'exam',
});

Exam.hasMany(Question, {
  foreignKey: 'examId',
  as: 'questions',
});

export default Question;
