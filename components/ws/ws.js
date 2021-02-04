const { Op } = require('sequelize');
const { verifyToken } = require('../../utils/token');
const client = require('../../utils/redis');
const { Chat, Message } = require('../../models');

class Ws {
  clients = {};

  /**
   * Check authorization of socket
   * @param socket {Object}
   * @returns token {String}
   */
  checkAuth(socket) {
    const { authorization } = socket.handshake.query;


    if (!authorization) return;

    const [, token] = authorization.split(' ');

    if (!token) return;

    return token;
  }

  /**
   * Initialize socket
   * @param socket {Object}
   * @returns id of sending client {void|String}
   */
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

  /**
   * Send private message from senderId with chatId or userId
   * @param senderId {String}
   * @param chatId {String}
   * @param userId {String}
   * @param message {String}
   * @returns {Promise<void>}
   */
  async sendMessage(senderId, chatId, userId, message) {
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
}

module.exports = new Ws();