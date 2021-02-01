const checkAuth = require('../../middlewares/checkAuth');
const { chats } = require('../../components/http');

module.exports = (router) => {
  router.get('/chats/messages', checkAuth, async (ctx) => {
    ctx.body = await chats.getMessages(ctx.state.user, ctx.query);
  });

  router.get('/chats', checkAuth, async (ctx) => {
    ctx.body = await chats.getChats(ctx.state.user.id, ctx.query.username);
  });
};