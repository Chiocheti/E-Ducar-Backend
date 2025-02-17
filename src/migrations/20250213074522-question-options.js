'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('question_options',
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          unique: true,
          allowNull: false,
          defaultValue: Sequelize.UUIDV4,
        },
        question_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'questions',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        answer: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        is_answer: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        order: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('question_options');
  }
};
