import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import db from './';
import Question from './Question';

class QuestionOption extends Model {
  declare id: string;
  declare questionId: string;
  declare answer: string;
  declare isAnswer: boolean;
  declare order: number;
};

QuestionOption.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'questions',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  answer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAnswer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize: db,
  tableName: 'question_options',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeCreate: (item) => {
      item.id = uuidv4();
    }
  }
});

QuestionOption.belongsTo(Question, {
  foreignKey: 'questionId',
  as: 'question',
});

Question.hasMany(QuestionOption, {
  foreignKey: 'questionId',
  as: 'questionOptions',
});

export default QuestionOption;
