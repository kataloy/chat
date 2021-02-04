const HttpError = require('./HttpError');

class AuthorizationError extends HttpError {
  constructor(message) {
    super(401, message);
  }
}

module.exports = AuthorizationError;
