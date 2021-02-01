const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

const createToken = id => jwt.sign({ id }, SECRET_KEY);
const verifyToken = token => jwt.verify(token, SECRET_KEY);

module.exports = {
  createToken,
  verifyToken,
};