const { Op } = require('sequelize');
const client = require('../../utils/redis');
const { User, Message, Chat, sequelize } = require('../../models');

class Chats {
  /**
   * Get messages by chatId or userId
   * @param user {Object}
   * @param params {Object}
   * @param [params.chatId] {String}
   * @param [params.userId] {String}
   * @returns {Promise<void|Message[]>}
   */
  async getMessages({ id }, { chatId, userId }) {
    if (chatId) {
      return await Message.findAll({
        where: { chatId },
        order: [['createdAt', 'ASC']],
      });
    }

    const chat = await Chat.findOne({
      where: {
        [Op.and]: [
          //sequelize.where(sequelize.fn('cardinality', sequelize.col('participants')), 2),
          { participants: { [Op.contains]: [userId] } },
          { participants: { [Op.contains]: [id] } },
        ],
      },
    });

    if (!chat) return;

    return await Message.findAll({
      where: { chatId: chat.id },
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Find new chats by username
   * @param user {Object}
   * @param [user.id] {String}
   * @param params {Object}
   * @param [params.username] {String}
   * @returns {Promise<Chat[]>}
   */
  async findChats({ id }, { username }) {
    const user = await User.findAll({
      limit: 10,
      where: {
        username: {
          [Op.iLike]: `%${username}%`,
        },
      },
    });

    const chatsByUsername =  await Promise.all(user.map(async item => {
      const chat = await Chat.findOne({
        where: {
          participants: {
            [Op.contains]: [id, item.id],
          },
        },
        order: [['updatedAt', 'DESC']],
      });

      if (!chat) {
        return {
          name: item.username,
          userId: item.id,
          lastMessage: '',
        }
      }

      const lastMessage = await client.get(`last_message_of:${chat.id}`);

      return {
        name: item.username,
        chatId: chat.id,
        lastMessage: lastMessage ? JSON.parse(lastMessage) : null,
      };
    }));

    const ownChats = await this.getChats({ id });

    return [...new Set([...chatsByUsername, ...ownChats].map(JSON.stringify))].map(JSON.parse);
  }

  /**
   * Get own chats by id
   * @param user {Object}
   * @param user.id {String}
   * @returns {Promise<Chat[]>}
   */
  async getChats({ id }) {
    const chats = await Chat.findAll({
      where: {
        participants: {
          [Op.contains]: [id],
        },
      },
    });

    return await Promise.all(chats.map(async (item) => {
      const user = await User.findOne({
        where: {
          id: item.participants.find(item => item !== id),
        },
        attributes: ['username']
      });

      const lastMessage = await client.get(`last_message_of:${item.id}`);

      return {
        name: user.username,
        chatId: item.id,
        lastMessage: lastMessage ? JSON.parse(lastMessage) : null,
      };
    }));
  }
 }

module.exports = new Chats();