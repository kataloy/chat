const { Message } = require('../models');

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await Message.destroy({
      where: {},
    });

    await queryInterface.removeColumn('Messages', 'senderUserId');
    await queryInterface.removeColumn('Messages', 'receiverUserId');
    await queryInterface.removeColumn('Messages', 'receiverGroupId');

    await queryInterface.addColumn('Messages', 'chatId', {
      type: DataTypes.UUID,
      allowNull: false,
    });

    await queryInterface.addColumn('Messages', 'userId', {
      type: DataTypes.UUID,
      allowNull: false,
    });

    await queryInterface.createTable('Chats', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      participants: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    });
  },

  down: () => {},
};
