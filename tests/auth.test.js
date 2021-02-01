const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const { User } = require('../models');

chai.use(chaiHttp);

const { expect, request } = chai;

describe('auth', () => {
  const USERNAME = 'Test';
  const PASSWORD = 'Test123';

  let token;

  before(async () => {
    await User.destroy({
      where: {},
    });
  });

  it('sign in with non-existing username', async () => {
    const { status, body } = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        username: USERNAME,
        password: PASSWORD,
      });

    expect(status).to.be.equal(401);
    expect(body).to.be.deep.equal({});
  });

  it('sign up', async () => {
    const { status, body } = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        username: USERNAME,
        password: PASSWORD,
      });

    const user = await User.findOne({
      where: {
        username: USERNAME,
      }
    });

    expect(status).to.be.equal(200);
    expect(user.password).to.be.not.equal(PASSWORD);
    expect(body).to.be.deep.equal({ ok: true });
    expect(user).to.be.not.equal(null);
  });

  it('sign up without username', async () => {
    const { status, body } = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        password: PASSWORD,
      });

    expect(status).to.be.equal(400);
    expect(body).to.be.deep.equal({});
  });

  it('sign up without password', async () => {
    const { status, body } = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        username: USERNAME,
      });

    expect(status).to.be.equal(400);
    expect(body).to.be.deep.equal({});
  });

  it('sign in with wrong password', async () => {
    const wrongPassword = '123123'

    const { status, body } = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        username: USERNAME,
        password: wrongPassword,
      });

    expect(status).to.be.equal(401);
    expect(body).to.be.deep.equal({});
  });

  it('sign in', async () => {
    const { status, body } = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        username: USERNAME,
        password: PASSWORD,
      });

    token = body.token;

    expect(status).to.be.equal(200);
    expect(body).to.be.an('object');
    expect(token).to.be.a('string');
  });

  it('remove account', async () => {
    const { status, body } = await request(app)
      .delete('/api/v1/me')
      .set({
        authorization: `bearer ${token}`,
      });

    const user = await User.findOne({
      where: {
        username: USERNAME,
      }
    });

    expect(status).to.be.equal(200);
    expect(body).to.be.deep.equal({ ok: true });
    expect(user.isRemoved).to.be.equal(true);
  });
});
