const { verifyToken } = require('../utils/token.js');

module.exports = async (ctx, next) => {
  const { authorization } = ctx.headers;
  const [, token] = authorization.split(' ');

  try {
    ctx.state.user = await verifyToken(token);
  } catch (err) {
    ctx.throw(401);
  }

  await next();
};