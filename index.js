const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('@koa/router');
const bodyparser = require('koa-bodyparser');
const http = require('http');
const socket = require('socket.io');
const redis = require('redis');
const handleError = require('./middlewares/handleErrors');
const { auth, chats } = require('./controllers/http');
const { PORT, socketOptions } = require('./config');
const ws = require('./controllers/ws');

const app = new Koa();
const router = new Router({ prefix: '/api/v1' });
const redisClient = redis.createClient();

app.on('error', console.error);
redisClient.on("error", function(error) {
  console.error(error);
});

auth(router);
chats(router, redisClient);

app.use(cors());
app.use(handleError);
app.use(bodyparser());
app.use(router.routes());

const server = http.createServer(app.callback());

const io = socket(server, socketOptions);

io.on('connection', async (socket) => {
  await ws(socket, redisClient);
});

module.exports = server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});