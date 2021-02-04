const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient();

client.on('error', error => console.error(error));

client.get = promisify(client.get);
client.set = promisify(client.set);

module.exports = client;
