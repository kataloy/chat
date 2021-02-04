module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.changeColumn('Users', 'password', {
      type: DataTypes.STRING,
      allowNull: false,
    });
  },

  down: () => {},
};
