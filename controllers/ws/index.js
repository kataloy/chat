const ws = require('../../components/ws/ws');

module.exports = async (socket, redisClient) => {
  const senderId = ws.initSocket(socket);

  socket.on('new private message', async ({ chatId, userId, message }) => {
   await ws.sendPrivateMessage(senderId, chatId, userId, message, redisClient);
  });

  socket.on('new group message', async ({receiverId, message}) => {
    await ws.sendGroupMessage();
  });
};