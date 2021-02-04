const http = require('http');
const path = require('path');
const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('@koa/router');
const bodyparser = require('koa-bodyparser');
const { koaSwagger } = require('koa2-swagger-ui');
const yamljs = require('yamljs');
const socket = require('socket.io');
const handleError = require('./middlewares/handleErrors');
const { auth, chats } = require('./controllers/http');
const { PORT, socketOptions } = require('./config');
const ws = require('./controllers/ws');

const app = new Koa();
const router = new Router({ prefix: '/api/v1' });

const spec = yamljs.load(path.resolve('docs', 'openapi.yml'));

app.on('error', console.error);

auth(router);
chats(router);

app.use(cors());
app.use(handleError);

app.use(koaSwagger({
  routePrefix: '/api-docs',
  specPrefix: '/api-docs/spec.json',
  swaggerOptions: { spec },
  hideTopbar: true,
  exposeSpec: true,
}));

app.use(bodyparser());
app.use(router.routes());

const server = http.createServer(app.callback());

const io = socket(server, socketOptions);

io.on('connection', async (socket) => {
  await ws(socket);
});

module.exports = server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
