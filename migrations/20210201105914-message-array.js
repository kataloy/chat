'use strict';

const { Chat } = require('../models');

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('Chats', '_participants', {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true
    });

    const chats = await Chat.findAll();

    for (const chat of chats) {
      await chat.update({
        _participants: chat.participants
      });
    }

    await queryInterface.removeColumn('Chats', 'participants');
    await queryInterface.renameColumn('Chats', '_participants', 'participants');

    await queryInterface.changeColumn('Chats', 'participants', {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false
    })
  },

  down: () => {}
};
