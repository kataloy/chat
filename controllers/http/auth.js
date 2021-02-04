const { auth } = require('../../components/http');
const { ValidationError } = require('../../errors/ValidationError');

module.exports = (router) => {
  router.post('/auth/signup', async (ctx) => {
    if (!ctx.request.body.password) {
      throw new ValidationError('Password is required!');
    }

    if (ctx.request.body.password < 6) {
      throw new ValidationError('Bad password!');
    }

    if (!ctx.request.body.username) {
      throw new ValidationError('Username is required!');
    }

    ctx.body = await auth.signUp(ctx.request.body);
  });

  router.post('/auth/signin', async (ctx) => {
    if (!ctx.request.body.password) {
      throw new ValidationError('Password is required!');
    }

    if (!ctx.request.body.username) {
      throw new ValidationError('Username is required!');
    }
    ctx.body = await auth.signIn(ctx.request.body);
  });
};
