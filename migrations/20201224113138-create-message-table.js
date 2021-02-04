module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('Messages', {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuid(),
        primaryKey: true,
      },
      senderUserId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      receiverUserId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      receiverGroupId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
    });

    await queryInterface.createTable('Groups', {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuid(),
        primaryKey: true,
      },
      users: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    });
  },

  down: async () => {},
};
