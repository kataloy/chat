const { Op, Sequelize } = require('sequelize');
const { promisify } = require("util");
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
          sequelize.where(sequelize.fn('cardinality', sequelize.col('participants')), 2),
          { participants: { [Op.contains]: [userId] } },
          { participants: { [Op.contains]: [id] } },
        ],
      },
    });

    if (!chat) return;

    return await Message.findAll({
      where: {
        chatId: chat.id,
      },
      order: [['createdAt', 'ASC']],
    });
  }

  async getChats(id, username, redisClient) {
    const getAsync = promisify(redisClient.get).bind(redisClient);

    let chatsFromSearch = [];

    if (username) {
      const user = await User.findAll({
        limit: 10,
        where: {
          username: {
            [Op.iLike]: `%${username}%`,
          },
        },
      });

      chatsFromSearch =  await Promise.all(user.map(async item => {
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
        const lastMessage = await getAsync(`Last message of ${chat.id}`);

        return {
          name: item.username,
          chatId: chat.id,
          lastMessage: JSON.parse(lastMessage).message,
          updatedAt: chat.updatedAt,
        }
      }));
    }

    const chats = await Chat.findAll({
      where: {
        participants: {
          [Op.contains]: [id],
        },
      },
      order: [['updatedAt', 'DESC']],
    });

    const existingChats =  await Promise.all(chats.map(async (item) => {
      let user, name;

      const participants = item.participants.filter(item => item !== id);

      if (participants.length === 1) {
        user = await User.findOne({
          where: {
            id: participants[0],
          }
        });

        name = user.username;
      } else {
        name = item.name;
      }

      const lastMessage = await getAsync(`Last message of ${item.id}`);

      return {
        name,
        chatId: item.id,
        lastMessage: JSON.parse(lastMessage).message,
        updatedAt: item.updatedAt,
      }
    }));

    return [...new Set([...chatsFromSearch, ...existingChats].map(JSON.stringify))].map(JSON.parse);
  }
}

module.exports = new Chats();