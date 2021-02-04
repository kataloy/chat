const sha256 = require('js-sha256');
const { ValidationError, AuthorizationError } = require('../../errors');
const { SALT } = require('../../config');
const { User } = require('../../models');
const { createToken } = require('../../utils/token');

class Auth {
  /**
   * Sign up with username and password
   * @param username {String}
   * @param password {String}
   * @returns {Promise<{id: *, username: *}>}
   */
  async signUp({ username, password }) {
    const user = await User.findOne({
      where: {
        username,
      },
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
    };
  }

  /**
   * Sign in with username and password
   * @param username {String}
   * @param password {String}
   * @returns {Promise<{token: (*)}>}
   */
  async signIn({ username, password }) {
    const user = await User.findOne({
      where: {
        username,
        password: sha256(`${SALT}${password}`),
      },
    });

    if (!user) {
      throw new AuthorizationError('There is no such user!');
    }

    return { token: createToken(user.id) };
  }
}

module.exports = new Auth();
