const chai = require('chai');
const chaiHttp = require('chai-http');
const io = require('socket.io-client')
const app = require('../');
const auth = require('../components/http/auth');
const { createToken} = require('../utils/token');
const { User, Message } = require('../models');

const cleanup = async () => {
  return await Promise.all([
    User.destroy({ where: {} }),
    Message.destroy({ where: {} }),
  ]);
};

const { expect } = chai;

describe('io', () => {
  const MESSAGE = 'Hello!';

  let user1;
  let user2;
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

  it('send and receive private message', (done) => {
    socket.emit('new private message', {
      receiverId: user2.id,
      message: MESSAGE,
    });

    socket.on('new private message', async (message) => {
      expect(message).to.be.a('string');
      expect(message).to.be.equal(MESSAGE);

      const record = await Message.findOne({
        where: {
          senderUserId: user1.id,
          receiverUserId: user2.id,
          message: MESSAGE,
        }
      });

      expect(record).to.be.not.equal(null);

      done();
    });
  });
});