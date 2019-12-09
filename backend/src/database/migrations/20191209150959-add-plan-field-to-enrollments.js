module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('enrollments', 'plan_id', {
      type: Sequelize.INTEGER,
      references: { model: 'plans', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('enrollments', 'plan_id');
  },
};
