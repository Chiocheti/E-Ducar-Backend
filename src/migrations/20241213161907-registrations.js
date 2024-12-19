'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('registration',
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          unique: true,
          allowNull: false,
          defaultValue: Sequelize.UUIDV4,
        },
        student_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'students',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        course_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'courses',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        register_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        conclusion_date: {
          type: Sequelize.DATEONLY,
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
    await queryInterface.dropTable('registration');
  }
};
