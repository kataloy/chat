module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('Users', 'isRemoved', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    });
  },

  down: () => {},
};
