const ws = require('../../components/ws/ws');

module.exports = async (socket) => {
  const senderId = ws.initSocket(socket);

  socket.on('new private message', async ({ chatId, userId, message }) => {
    await ws.sendMessage(senderId, chatId, userId, message);
  });
};
