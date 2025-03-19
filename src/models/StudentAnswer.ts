import { DataTypes, Model } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import db from "./";
import Registration from "./Registration";
import Exam from "./Exams";
import Question from "./Question";
import QuestionOption from "./QuestionOption";

class StudentAnswer extends Model {
  declare id: string;
  declare registrationId: string;
  declare examId: string;
  declare questionId: string;
  declare questionOptionId: string;
}

StudentAnswer.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    registration_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "registrations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    exam_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "exams",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "questions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    question_option_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "question_options",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    sequelize: db,
    tableName: "students_answers",
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: (item) => {
        item.id = uuidv4();
      },
      beforeBulkCreate: (item) => {
        item.forEach((item) => {
          item.id = uuidv4();
        });
      },
    },
  }
);

StudentAnswer.belongsTo(Registration, {
  foreignKey: "registrationId",
  as: "registration",
});

Registration.hasMany(StudentAnswer, {
  foreignKey: "registrationId",
  as: "studentsAnswers",
});

StudentAnswer.belongsTo(Exam, {
  foreignKey: "examId",
  as: "exam",
});

Exam.hasMany(StudentAnswer, {
  foreignKey: "examId",
  as: "studentsAnswers",
});

StudentAnswer.belongsTo(Question, {
  foreignKey: "questionId",
  as: "question",
});

Question.hasMany(StudentAnswer, {
  foreignKey: "questionId",
  as: "studentsAnswers",
});

StudentAnswer.belongsTo(QuestionOption, {
  foreignKey: "questionOptionId",
  as: "questionOption",
});

QuestionOption.hasMany(StudentAnswer, {
  foreignKey: "questionOptionId",
  as: "studentsAnswers",
});

export default StudentAnswer;
