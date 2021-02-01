const { Op } = require('sequelize');
const { verifyToken } = require('../../utils/token');
const client = require('../../utils/redis');
const { Chat, Message } = require('../../models');

class Ws {
  clients = {};

  checkAuth(socket) {
    const { authorization } = socket.handshake.query;


    if (!authorization) return;

    const [, token] = authorization.split(' ');

    if (!token) return;

    return token;
  }

  initSocket(socket) {
    let senderId;
    const token = this.checkAuth(socket)

    if (!token) return;

    try {
      senderId = verifyToken(token).id;
    } catch (err) {
      console.error(err);
    }

    if (!senderId) return;

    if (!this.clients[senderId]) {
      this.clients[senderId] = [];
    }

    this.clients[senderId].push(socket);

    return senderId;
  }

  async sendPrivateMessage(senderId, chatId, userId, message) {
    if (!chatId && !userId) {
      throw new Error('chatId or userId is required');
    }

    const chat = await Chat.findOne({
      where: {
        participants: {
          [Op.contains]: [senderId, userId],
        }
      }
    });

    if (!chat && !chatId) {
      const record = await Chat.create({
        participants: [
          senderId,
          userId,
        ]
      });

      chatId = record.id;
    }

    if (!chatId) {
      chatId = chat.id;
    }

    const msg = await Message.create({
      chatId,
      userId: senderId,
      message,
    });

    await client.set(`last_message_of:${msg.chatId}`, JSON.stringify(msg));

    const { participants } = await Chat.findOne({
      where: {
        id: chatId,
      }
    });

    const receiverId = participants.filter(item => item !== senderId);

    [
      ...(this.clients[senderId] || []),
      ...(this.clients[receiverId] || [])
    ].forEach((client) => {
      client.emit('new private message', message);
    });
  }

  async sendGroupMessage() {

  }
}

module.exports = new Ws();