const chai = require('chai');
const chaiHttp = require('chai-http');
const io = require('socket.io-client')
const app = require('../');
const { Op } = require('sequelize');
const auth = require('../components/http/auth');
const { createToken} = require('../utils/token');
const { User, Message, Chat } = require('../models');

const cleanup = async () => {
  return await Promise.all([
    User.destroy({ where: {} }),
    Message.destroy({ where: {} }),
    Chat.destroy({ where: {} }),
  ]);
};

const { expect } = chai;

describe('io', () => {
  const MESSAGE1 = 'Hello!';
  const MESSAGE2 = 'Hello!!';
  const MESSAGE3 = 'Hello!!!';

  let user1;
  let user2;
  let chatId;
  let socket;

  before(async () => {
    const USERNAME_1 = 'admin';
    const PASSWORD_1 = 'admin';
    const USERNAME_2 = 'test';
    const PASSWORD_2 = 'test';

    await cleanup();

    [user1, user2] = await Promise.all([
      auth.signUp({
        username: USERNAME_1,
        password: PASSWORD_1,
      }),
      auth.signUp({
        username: USERNAME_2,
        password: PASSWORD_2,
      }),
    ]);
  });

  after(cleanup);

  it('connect', (done) => {
    const token = createToken(user1.id);

    socket = io('ws://localhost:3000', {
      query: {
        authorization: `bearer ${token}`
      }
    });

    socket.on('connect', () => {
      expect(socket.connected).to.be.equal(true);
      expect(socket.id).to.be.a('string');

      done();
    });
  });

  it('create chat and send and receive message with userId', (done) => {
    socket.emit('new private message', {
      userId: user2.id,
      message: MESSAGE1,
    });

    socket.on('new private message', async (message) => {
      expect(message).to.be.a('string');
      expect(message).to.be.equal(MESSAGE1);

      const chat = await Chat.findOne({
        where: {
          participants: {
            [Op.contains]: [user1.id, user2.id],
          },
        },
      });

      chatId = chat.id;

      const msg = await Message.findOne({
        where: {
          userId: user1.id,
          chatId: chatId,
          message: MESSAGE1,
        }
      });

      expect(chat).to.be.not.equal(null);
      expect(msg).to.be.not.equal(null);

      done();
    });
  });

  it('send and receive message with userId', (done) => {
    socket.emit('new private message', {
      userId: user2.id,
      message: MESSAGE2,
    });

    socket.on('new private message', async (message) => {
      expect(message).to.be.a('string');
      expect(message).to.be.equal(MESSAGE2);

      const chat = await Chat.findAll({
        where: {
          participants: {
            [Op.contains]: [user1.id, user2.id],
          },
        },
      });

      const msg = await Message.findOne({
        where: {
          userId: user1.id,
          chatId,
          message: MESSAGE2,
        },
      });

      expect(chat.length).to.be.equal(1);
      expect(msg).to.be.not.equal(null);

      done();
    });
  });

  it('send and receive message with chatId', (done) => {
    socket.emit('new private message', {
      chatId,
      message: MESSAGE3,
    });

    socket.on('new private message', async (message) => {
      expect(message).to.be.a('string');
      expect(message).to.be.equal(MESSAGE3);

      const chat = await Chat.findAll({
        where: {
          participants: {
            [Op.contains]: [user1.id, user2.id],
          },
        },
      });

      const msg = await Message.findOne({
        where: {
          userId: user1.id,
          chatId,
          message: MESSAGE3,
        },
      });

      expect(chat.length).to.be.equal(1);
      expect(msg).to.be.not.equal(null);

      done();
    });
  });
});