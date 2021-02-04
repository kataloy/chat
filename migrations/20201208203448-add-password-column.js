module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('Users', 'password', {
      type: DataTypes.STRING,
    });
  },

  down: () => {},
};
