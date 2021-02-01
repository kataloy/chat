module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = ctx.status >= 500 ? 'Internal server error' : err.message;

    ctx.app.emit('error', err, ctx);
  }
};