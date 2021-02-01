const sha256 = require('js-sha256');
const { ValidationError, AuthorizationError} = require('../../errors');
const { SALT } = require('../../config');
const { User } = require('../../models');
const { createToken } = require('../../utils/token');

class Auth {
  constructor() {}

  async signUp({ username, password }) {
    const user = await User.findOne({
      where: {
        username,
      }
    });

    if (user) {
      throw new ValidationError('This username already exists!');
    }

    const record = await User.create({
      username,
      password: sha256(`${SALT}${password}`),
    });

    return {
      username: record.username,
      id: record.id,
    }
  };

  async signIn({ username, password }) {
    const user = await User.findOne({
      where: {
        username,
        password: sha256(`${SALT}${password}`),
      }
    });

    if (!user) {
      throw new AuthorizationError('There is no such user!');
    }

    return { token: createToken(user.id) };
  };

  async removeAccount({ id }) {
    await User.update({
      isRemoved: true,
    }, {
      where: {
        id,
      },
    });

    return { ok: true };
  };
}

module.exports = new Auth();
