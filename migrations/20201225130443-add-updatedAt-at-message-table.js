module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('Messages', 'updatedAt', {
      type: DataTypes.DATE,
    });
  },

  down: () => {},
};
